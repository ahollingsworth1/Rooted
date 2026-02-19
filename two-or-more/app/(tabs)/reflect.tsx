import RootedHeader from '@/components/RootedHeader';
import { LENT_DEVOTIONALS } from '@/constants/lentDevotionals';
import { getTodayLentDay } from '@/constants/lentPlan';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Reflection {
  text: string;
  submittedAt: string;
  userName: string;
}

interface DayReflections {
  [userId: string]: Reflection;
}

interface AISummary {
  commonGround: string;
  questions: string[];
}

export default function ReflectScreen() {
  const [myReflection, setMyReflection] = useState('');
  const [savedReflection, setSavedReflection] = useState<Reflection | null>(null);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerReflection, setPartnerReflection] = useState<Reflection | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [showFullDevotional, setShowFullDevotional] = useState(false);

  const today = getTodayLentDay();
  const user = auth.currentUser;

  // Fetch verse text
  useEffect(() => {
    if (!today) return;
    fetch(`https://bible-api.com/${encodeURIComponent(today.verse)}`)
      .then(res => res.json())
      .then(data => setVerseText(data.text?.trim()))
      .catch(() => setVerseText(null));
  }, [today?.verse]);

  // Load couple data FIRST, then start snapshot listener with resolved IDs
  useEffect(() => {
    if (!user || !today) return;

    let cleanup: (() => void) | undefined;

    const fetchCoupleData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let resolvedCoupleId = user.uid;
      let resolvedPartnerId: string | null = null;

      if (userDoc.exists()) {
        const data = userDoc.data();
        resolvedCoupleId = data.coupleId || user.uid;
        resolvedPartnerId = data.partnerId || null;
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Friend',
          coupleId: user.uid,
        });
      }

      console.log('=== COUPLE DATA ===');
      console.log('resolvedCoupleId:', resolvedCoupleId);
      console.log('resolvedPartnerId:', resolvedPartnerId);

      setCoupleId(resolvedCoupleId);
      setPartnerId(resolvedPartnerId);

      // Start listener only after we have the correct IDs
      const reflectionRef = doc(db, 'reflections', `${resolvedCoupleId}_day${today.day}`);
      const unsubscribe = onSnapshot(reflectionRef, (snapshot) => {
        console.log('=== SNAPSHOT FIRED ===');
        console.log('snapshot exists:', snapshot.exists());

        if (snapshot.exists()) {
          const data = snapshot.data() as DayReflections & { aiSummary?: AISummary };
          console.log('doc keys:', Object.keys(data));
          console.log('my uid:', user.uid);
          console.log('has my reflection:', !!data[user.uid]);
          console.log('resolvedPartnerId in snapshot:', resolvedPartnerId);
          console.log('has partner reflection:', resolvedPartnerId ? !!data[resolvedPartnerId] : 'NO PARTNER ID');
          console.log('has aiSummary:', !!data.aiSummary);

          if (data[user.uid]) setSavedReflection(data[user.uid]);

          if (resolvedPartnerId && data[resolvedPartnerId]) {
            console.log('Setting partner submitted TRUE');
            setPartnerSubmitted(true);
            setPartnerReflection(data[resolvedPartnerId]);
          }

          if (data.aiSummary) setAiSummary(data.aiSummary);
        }
      });

      cleanup = unsubscribe;
    };

    fetchCoupleData();
    return () => cleanup?.();
  }, [user, today]);

  // Auto-generate summary when both have submitted and no summary yet
  useEffect(() => {
    console.log('=== SUMMARY CHECK ===', { savedReflection: !!savedReflection, partnerReflection: !!partnerReflection, aiSummary: !!aiSummary, isGeneratingSummary });
    if (savedReflection && partnerReflection && !aiSummary && !isGeneratingSummary) {
      console.log('TRIGGERING SUMMARY GENERATION');
      generateAISummary(savedReflection, partnerReflection);
    }
  }, [savedReflection, partnerReflection, aiSummary]);

  const saveReflection = async () => {
    if (!user || !today || !coupleId || !myReflection.trim()) return;
    setIsSaving(true);
    try {
      const reflectionRef = doc(db, 'reflections', `${coupleId}_day${today.day}`);
      const userName = user.displayName || user.email?.split('@')[0] || 'Friend';
      await setDoc(reflectionRef, {
        [user.uid]: { text: myReflection.trim(), submittedAt: new Date().toISOString(), userName },
      }, { merge: true });
    } catch (e) {
      Alert.alert('Error', 'Could not save your reflection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAISummary = async (myRef: Reflection, partnerRef: Reflection) => {
    if (!coupleId || !today) return;
    setIsGeneratingSummary(true);
    try {
      const prompt = today.theme.includes('Rest')
        ? `Two Christian partners completed a week of Lent devotionals. Here are their weekly reflections:
Partner 1 (${myRef.userName}): "${myRef.text}"
Partner 2 (${partnerRef.userName}): "${partnerRef.text}"
This is a rest/reflection day. Please:
1. Write 2-3 sentences summarizing what they have in common spiritually this week
2. Generate 4 deeper discussion questions to help them grow together
Respond ONLY as JSON: {"commonGround": "...", "questions": ["...", "...", "...", "..."]}`
        : `Two Christian partners reflected on today's Lent devotional.
Theme: ${today.theme}
Verse: ${today.verse}
Prompt: ${today.prompt}
Partner 1 (${myRef.userName}): "${myRef.text}"
Partner 2 (${partnerRef.userName}): "${partnerRef.text}"
Please:
1. Write 2-3 sentences about what they have in common spiritually
2. Generate 3 discussion questions to help them go deeper together
Respond ONLY as JSON: {"commonGround": "...", "questions": ["...", "...", "..."]}`;

      console.log('Calling OpenAI...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
      });
      const data = await response.json();
      console.log('OpenAI raw response:', JSON.stringify(data));
      const parsed: AISummary = JSON.parse(data.choices[0].message.content);
      const reflectionRef = doc(db, 'reflections', `${coupleId}_day${today.day}`);
      await setDoc(reflectionRef, { aiSummary: parsed }, { merge: true });
      setAiSummary(parsed);
      console.log('Summary saved!');
    } catch (e) {
      console.error('Summary generation failed:', e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!today) {
    return (
      <View style={styles.screen}>
        <RootedHeader />
        <Text style={styles.emptyText}>Lent hasn't started yet — check back on Ash Wednesday!</Text>
      </View>
    );
  }

  const devotional = LENT_DEVOTIONALS[today.day];
  const devotionalParagraphs = devotional ? devotional.split('\n\n') : [];
  const bothSubmitted = !!savedReflection && partnerSubmitted;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FAF6F0' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

        <RootedHeader subtitle="40 Days Together" />

        {/* Day tag */}
        <View style={styles.dayTagRow}>
          <View style={styles.dayTag}>
            <Text style={styles.dayTagText}>Day {today.day}</Text>
          </View>
          <Text style={styles.themeText}>{today.theme}</Text>
        </View>

        {/* Verse block */}
        <View style={styles.verseBlock}>
          <View style={styles.verseAccent} />
          <View style={styles.verseContent}>
            <Text style={styles.verseRef}>{today.verse}</Text>
            {verseText && <Text style={styles.verseFullText}>{verseText}</Text>}
          </View>
        </View>

        {/* Prompt */}
        <View style={styles.promptBlock}>
          <Text style={styles.promptLabel}>Today's Prompt</Text>
          <Text style={styles.promptText}>{today.prompt}</Text>
        </View>

        {/* Devotional */}
        {devotional && (
          <View style={styles.devotionalBlock}>
            <Text style={styles.devotionalLabel}>Today's Devotional</Text>
            <Text style={styles.devotionalText}>{devotionalParagraphs[0]}</Text>
            {showFullDevotional && devotionalParagraphs.slice(1).map((para, i) => (
              <Text key={i} style={styles.devotionalText}>{para}</Text>
            ))}
            <TouchableOpacity
              style={styles.readMoreBtn}
              onPress={() => setShowFullDevotional(!showFullDevotional)}
            >
              <Text style={styles.readMoreText}>
                {showFullDevotional ? 'Show less ↑' : 'Continue reading ↓'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* My Reflection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>My Reflection</Text>
          {savedReflection && (
            <Text style={styles.savedAt}>
              Submitted {new Date(savedReflection.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <View style={[styles.card, savedReflection && styles.cardSaved]}>
          {savedReflection ? (
            <>
              <Text style={styles.savedText}>{savedReflection.text}</Text>
              {!partnerSubmitted && (
                <View style={styles.waitingBanner}>
                  <View style={styles.waitingDot} />
                  <Text style={styles.waitingBannerText}>Waiting for your partner to submit...</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="What is God stirring in your heart today?"
                placeholderTextColor="#C4A882"
                multiline
                value={myReflection}
                onChangeText={setMyReflection}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.button, !myReflection.trim() && styles.buttonDisabled]}
                onPress={saveReflection}
                disabled={!myReflection.trim() || isSaving}
              >
                {isSaving ? <ActivityIndicator color="#FFF8F0" /> : <Text style={styles.buttonText}>Submit Reflection</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Partner status */}
        {!bothSubmitted && savedReflection && (
          <View style={styles.partnerStatusCard}>
            <View style={styles.partnerStatusRow}>
              <View style={[styles.statusDot, partnerSubmitted && styles.statusDotDone]} />
              <Text style={styles.partnerStatusText}>
                {partnerSubmitted
                  ? 'Your partner has submitted — generating your summary...'
                  : "Your partner hasn't submitted yet"}
              </Text>
            </View>
          </View>
        )}

        {/* Generating indicator */}
        {isGeneratingSummary && (
          <View style={styles.generatingCard}>
            <ActivityIndicator color="#A0522D" style={{ marginRight: 12 }} />
            <Text style={styles.generatingText}>Preparing your shared summary...</Text>
          </View>
        )}

        {/* AI Summary */}
        {bothSubmitted && aiSummary && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerSymbol}>✦</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryEyebrow}>Both of you have reflected</Text>
              <Text style={styles.summaryTitle}>
                {today.theme.includes('Rest') ? 'Your Week Together' : 'What God Is Doing In You Both'}
              </Text>

              <Text style={styles.summaryLabel}>What you have in common</Text>
              <Text style={styles.summaryText}>{aiSummary.commonGround}</Text>

              <Text style={styles.summaryLabel}>Discuss together</Text>
              {aiSummary.questions.map((q, i) => (
                <View key={i} style={styles.questionRow}>
                  <Text style={styles.questionNumber}>{i + 1}</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { backgroundColor: '#FAF6F0', paddingBottom: 60 },
  emptyText: { textAlign: 'center', color: '#8B6347', fontSize: 16, marginTop: 40, paddingHorizontal: 32, lineHeight: 26 },

  dayTagRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, marginBottom: 20, gap: 10 },
  dayTag: { backgroundColor: '#A0522D', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dayTagText: { color: '#FFF8F0', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  themeText: { fontSize: 14, color: '#6B4C35', fontWeight: '500', flex: 1 },

  verseBlock: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#FDF3E7', borderRadius: 16, overflow: 'hidden' },
  verseAccent: { width: 4, backgroundColor: '#A0522D' },
  verseContent: { flex: 1, padding: 16 },
  verseRef: { fontSize: 12, fontWeight: '700', color: '#A0522D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  verseFullText: { fontSize: 16, lineHeight: 26, color: '#3D2B1F', fontStyle: 'italic' },

  promptBlock: { paddingHorizontal: 20, marginBottom: 24 },
  promptLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  promptText: { fontSize: 17, lineHeight: 28, color: '#3D2B1F', fontWeight: '500' },

  devotionalBlock: {
    marginHorizontal: 20, marginBottom: 24, padding: 20,
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  devotionalLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  devotionalText: { fontSize: 15, lineHeight: 28, color: '#3D2B1F', marginBottom: 14 },
  readMoreBtn: { alignSelf: 'flex-start', paddingTop: 4 },
  readMoreText: { fontSize: 13, color: '#A0522D', fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#3D2B1F', letterSpacing: 0.3 },
  savedAt: { fontSize: 11, color: '#A0522D', opacity: 0.7 },

  card: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 18, padding: 18,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  cardSaved: { backgroundColor: '#FFFDF9' },
  savedText: { fontSize: 15, lineHeight: 26, color: '#3D2B1F' },
  waitingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#EDE0D4' },
  waitingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D4B896' },
  waitingBannerText: { fontSize: 13, color: '#8B6347', fontStyle: 'italic' },

  partnerStatusCard: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 14, padding: 14,
    backgroundColor: '#FDF9F5', borderWidth: 1, borderColor: '#E8D9C5',
  },
  partnerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D4B896' },
  statusDotDone: { backgroundColor: '#5C8A5C' },
  partnerStatusText: { fontSize: 13, color: '#6B4C35', flex: 1, lineHeight: 20 },

  generatingCard: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 14, padding: 16,
    backgroundColor: '#FDF3E7', borderWidth: 1, borderColor: '#C8956C',
    flexDirection: 'row', alignItems: 'center',
  },
  generatingText: { fontSize: 14, color: '#6B3A2A', fontStyle: 'italic', flex: 1 },

  input: { minHeight: 130, fontSize: 15, lineHeight: 26, color: '#3D2B1F', padding: 0, marginBottom: 16 },
  button: { backgroundColor: '#A0522D', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

  summaryCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 20,
    backgroundColor: '#FDF3E7', borderWidth: 1.5, borderColor: '#C8956C',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  summaryEyebrow: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: '#3D2B1F', marginBottom: 16, lineHeight: 24 },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginTop: 14 },
  summaryText: { fontSize: 15, lineHeight: 26, color: '#3D2B1F' },
  questionRow: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  questionNumber: { fontSize: 13, fontWeight: '800', color: '#A0522D', width: 18, marginTop: 2 },
  questionText: { fontSize: 15, lineHeight: 24, color: '#5C4033', fontStyle: 'italic', flex: 1 },
});