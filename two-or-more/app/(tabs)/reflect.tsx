import RootedHeader from '@/components/RootedHeader';
import { getPathwayById, PathwayDay } from '@/constants/pathways';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
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
  const [verseText, setVerseText] = useState<string | null>(null);
  const [showFullDevotional, setShowFullDevotional] = useState(false);
  const [today, setToday] = useState<PathwayDay | null>(null);
  const [pathwayColor, setPathwayColor] = useState('#A0522D');
  const [pathwayTitle, setPathwayTitle] = useState('');
  const [noPathway, setNoPathway] = useState(false);

  const user = auth.currentUser;

  // Load couple data and active pathway
  useEffect(() => {
    if (!user) return;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let resolvedCoupleId = user.uid;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        resolvedCoupleId = userData.coupleId || user.uid;
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Friend',
          coupleId: user.uid,
        });
      }

      setCoupleId(resolvedCoupleId);

      // Load active pathway from couple doc
      if (resolvedCoupleId !== user.uid) {
        const coupleDoc = await getDoc(doc(db, 'couples', resolvedCoupleId));
        if (coupleDoc.exists()) {
          const coupleData = coupleDoc.data();
          const pathwayId = coupleData.activePathwayId;
          const currentDay = coupleData.activePathwayDay || 1;

          if (pathwayId) {
            const pathway = getPathwayById(pathwayId);
            if (pathway) {
              const dayData = pathway.days[currentDay - 1];
              setToday(dayData || null);
              setPathwayColor(pathway.color);
              setPathwayTitle(pathway.title);
            }
          } else {
            setNoPathway(true);
          }
        } else {
          setNoPathway(true);
        }
      } else {
        setNoPathway(true);
      }

      // Listen for reflections
      const reflectionId = `${resolvedCoupleId}_day${(await getDoc(doc(db, 'couples', resolvedCoupleId))).data()?.activePathwayDay || 1}`;
      const reflectionRef = doc(db, 'reflections', reflectionId);
      const unsubscribe = onSnapshot(reflectionRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data() as Record<string, any>;

        const myData = data[user.uid];
        if (myData?.text) setSavedReflection(myData);

        const partnerKey = Object.keys(data).find(
          k => k !== user.uid && k !== 'aiSummary'
        );
        if (partnerKey && data[partnerKey]?.text) {
          setPartnerSubmitted(true);
          setPartnerReflection(data[partnerKey]);
        }

        if (data.aiSummary) setAiSummary(data.aiSummary);
      });

      cleanup = unsubscribe;
    };

    init();
    return () => cleanup?.();
  }, [user]);

  // Fetch verse text
  useEffect(() => {
    if (!today?.verse) return;
    fetch(`https://bible-api.com/${encodeURIComponent(today.verse)}`)
      .then(res => res.json())
      .then(data => setVerseText(data.text?.trim()))
      .catch(() => setVerseText(null));
  }, [today?.verse]);

  // Auto-generate summary when both submitted
  useEffect(() => {
    if (savedReflection && partnerReflection && !aiSummary && !isGeneratingSummary) {
      generateAISummary(savedReflection, partnerReflection);
    }
  }, [savedReflection, partnerReflection, aiSummary]);

  const saveReflection = async () => {
    if (!user || !today || !coupleId || !myReflection.trim()) return;
    setIsSaving(true);
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      const currentDay = coupleDoc.data()?.activePathwayDay || 1;
      const reflectionRef = doc(db, 'reflections', `${coupleId}_day${currentDay}`);
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
      const isRestDay = today.theme.toLowerCase().includes('rest');
      const prompt = isRestDay
        ? `Two Christian partners completed a week of devotionals on "${pathwayTitle}". Here are their reflections:
Partner 1 (${myRef.userName}): "${myRef.text}"
Partner 2 (${partnerRef.userName}): "${partnerRef.text}"
This is a rest/reflection day. Please:
1. Write 2-3 sentences summarizing what they have in common spiritually this week
2. Generate 4 deeper discussion questions to help them grow together
Respond ONLY as JSON: {"commonGround": "...", "questions": ["...", "...", "...", "..."]}`
        : `Two Christian partners reflected on today's devotional from the journey "${pathwayTitle}".
Theme: ${today.theme}
Verse: ${today.verse}
Prompt: ${today.prompt}
Partner 1 (${myRef.userName}): "${myRef.text}"
Partner 2 (${partnerRef.userName}): "${partnerRef.text}"
Please:
1. Write 2-3 sentences about what they have in common spiritually
2. Generate 3 discussion questions to help them go deeper together
Respond ONLY as JSON: {"commonGround": "...", "questions": ["...", "...", "..."]}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        console.error('No choices in OpenAI response:', data);
        return;
      }

      const raw = data.choices[0].message.content;
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed: AISummary = JSON.parse(clean);

      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      const currentDay = coupleDoc.data()?.activePathwayDay || 1;
      const reflectionRef = doc(db, 'reflections', `${coupleId}_day${currentDay}`);
      await setDoc(reflectionRef, { aiSummary: parsed }, { merge: true });
      setAiSummary(parsed);
    } catch (e) {
      console.error('Summary generation failed:', e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const advanceToNextDay = async () => {
    if (!coupleId || !today) return;
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      const coupleData = coupleDoc.data();
      const currentDay = coupleData?.activePathwayDay || 1;
      const pathway = getPathwayById(coupleData?.activePathwayId);
      if (!pathway) return;

      if (currentDay < pathway.duration) {
        await updateDoc(doc(db, 'couples', coupleId), {
          activePathwayDay: currentDay + 1,
        });
        const nextDay = pathway.days[currentDay];
        setToday(nextDay);
        setSavedReflection(null);
        setPartnerReflection(null);
        setPartnerSubmitted(false);
        setAiSummary(null);
        setMyReflection('');
      } else {
        Alert.alert('Journey Complete! 🎉', 'You have completed this pathway together. Visit the Journeys tab to begin a new one!');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not advance to next day.');
    }
  };

  // No partner linked yet
  if (noPathway) {
    return (
      <View style={styles.screen}>
        <RootedHeader subtitle="Daily Reflection" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌿</Text>
          <Text style={styles.emptyTitle}>No Active Journey</Text>
          <Text style={styles.emptyText}>
            Head to the Journeys tab to choose a pathway and invite your partner to begin together.
          </Text>
        </View>
      </View>
    );
  }

  if (!today) {
    return (
      <View style={styles.screen}>
        <RootedHeader />
        <ActivityIndicator color="#A0522D" style={{ marginTop: 40 }} />
      </View>
    );
  }

  const devotionalParagraphs = today.devotional.split('\n\n');
  const bothSubmitted = !!savedReflection && partnerSubmitted;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FAF6F0' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <RootedHeader subtitle={pathwayTitle} />

        {/* Day tag */}
        <View style={styles.dayTagRow}>
          <View style={[styles.dayTag, { backgroundColor: pathwayColor }]}>
            <Text style={styles.dayTagText}>Day {today.day}</Text>
          </View>
          <Text style={styles.themeText}>{today.theme}</Text>
        </View>

        {/* Verse block */}
        <View style={styles.verseBlock}>
          <View style={[styles.verseAccent, { backgroundColor: pathwayColor }]} />
          <View style={styles.verseContent}>
            <Text style={[styles.verseRef, { color: pathwayColor }]}>{today.verse}</Text>
            {verseText && <Text style={styles.verseFullText}>{verseText}</Text>}
          </View>
        </View>

        {/* Prompt */}
        <View style={styles.promptBlock}>
          <Text style={[styles.promptLabel, { color: pathwayColor }]}>Today's Prompt</Text>
          <Text style={styles.promptText}>{today.prompt}</Text>
        </View>

        {/* Devotional */}
        <View style={styles.devotionalBlock}>
          <Text style={[styles.devotionalLabel, { color: pathwayColor }]}>Today's Devotional</Text>
          <Text style={styles.devotionalText}>{devotionalParagraphs[0]}</Text>
          {showFullDevotional && devotionalParagraphs.slice(1).map((para, i) => (
            <Text key={i} style={styles.devotionalText}>{para}</Text>
          ))}
          <TouchableOpacity style={styles.readMoreBtn} onPress={() => setShowFullDevotional(!showFullDevotional)}>
            <Text style={[styles.readMoreText, { color: pathwayColor }]}>
              {showFullDevotional ? 'Show less ↑' : 'Continue reading ↓'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* My reflection */}
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
                style={[styles.button, { backgroundColor: pathwayColor }, !myReflection.trim() && styles.buttonDisabled]}
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

        {isGeneratingSummary && (
          <View style={styles.generatingCard}>
            <ActivityIndicator color={pathwayColor} style={{ marginRight: 12 }} />
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

            <View style={[styles.summaryCard, { borderColor: pathwayColor }]}>
              <Text style={[styles.summaryEyebrow, { color: pathwayColor }]}>Both of you have reflected</Text>
              <Text style={styles.summaryTitle}>
                {today.theme.toLowerCase().includes('rest') ? 'Your Week Together' : 'What God Is Doing In You Both'}
              </Text>
              <Text style={[styles.summaryLabel, { color: pathwayColor }]}>What you have in common</Text>
              <Text style={styles.summaryText}>{aiSummary.commonGround}</Text>
              <Text style={[styles.summaryLabel, { color: pathwayColor }]}>Discuss together</Text>
              {aiSummary.questions.map((q, i) => (
                <View key={i} style={styles.questionRow}>
                  <Text style={[styles.questionNumber, { color: pathwayColor }]}>{i + 1}</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.nextDayBtn, { backgroundColor: pathwayColor }]}
                onPress={advanceToNextDay}
              >
                <Text style={styles.nextDayBtnText}>Continue to Day {today.day + 1} →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { backgroundColor: '#FAF6F0', paddingBottom: 60 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#3D2B1F', marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#8B6347', textAlign: 'center', lineHeight: 24 },

  dayTagRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, marginBottom: 20, gap: 10 },
  dayTag: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dayTagText: { color: '#FFF8F0', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  themeText: { fontSize: 14, color: '#6B4C35', fontWeight: '500', flex: 1 },

  verseBlock: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#FDF3E7', borderRadius: 16, overflow: 'hidden' },
  verseAccent: { width: 4 },
  verseContent: { flex: 1, padding: 16 },
  verseRef: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  verseFullText: { fontSize: 16, lineHeight: 26, color: '#3D2B1F', fontStyle: 'italic' },

  promptBlock: { paddingHorizontal: 20, marginBottom: 24 },
  promptLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  promptText: { fontSize: 17, lineHeight: 28, color: '#3D2B1F', fontWeight: '500' },

  devotionalBlock: {
    marginHorizontal: 20, marginBottom: 24, padding: 20,
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  devotionalLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  devotionalText: { fontSize: 15, lineHeight: 28, color: '#3D2B1F', marginBottom: 14 },
  readMoreBtn: { alignSelf: 'flex-start', paddingTop: 4 },
  readMoreText: { fontSize: 13, fontWeight: '600' },

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
  button: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

  summaryCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 20,
    backgroundColor: '#FDF3E7', borderWidth: 1.5,
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  summaryEyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: '#3D2B1F', marginBottom: 16, lineHeight: 24 },
  summaryLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginTop: 14 },
  summaryText: { fontSize: 15, lineHeight: 26, color: '#3D2B1F' },
  questionRow: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  questionNumber: { fontSize: 13, fontWeight: '800', width: 18, marginTop: 2 },
  questionText: { fontSize: 15, lineHeight: 24, color: '#5C4033', fontStyle: 'italic', flex: 1 },
  nextDayBtn: { marginTop: 20, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  nextDayBtnText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15 },
});