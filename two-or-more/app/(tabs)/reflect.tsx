import RootedHeader from '@/components/RootedHeader';
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
  const [partnerReflection, setPartnerReflection] = useState<Reflection | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [verseText, setVerseText] = useState<string | null>(null);

  const today = getTodayLentDay();
  const user = auth.currentUser;

  useEffect(() => {
    if (!today) return;
    fetch(`https://bible-api.com/${encodeURIComponent(today.verse)}`)
      .then(res => res.json())
      .then(data => setVerseText(data.text?.trim()))
      .catch(() => setVerseText(null));
  }, [today?.verse]);

  useEffect(() => {
    if (!user || !today) return;
    const fetchCoupleData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCoupleId(data.coupleId || user.uid);
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.email?.split('@')[0] || 'Friend',
          coupleId: user.uid,
        });
        setCoupleId(user.uid);
      }
    };
    fetchCoupleData();
  }, [user, today]);

  useEffect(() => {
    if (!coupleId || !today || !user) return;
    const reflectionRef = doc(db, 'reflections', `${coupleId}_day${today.day}`);
    const unsubscribe = onSnapshot(reflectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as DayReflections & { aiSummary?: AISummary };
        if (data[user.uid]) setSavedReflection(data[user.uid]);
        const partnerKey = Object.keys(data).find(
          (k) => k !== user.uid && k !== 'aiSummary'
        );
        if (partnerKey && data[partnerKey]) setPartnerReflection(data[partnerKey] as Reflection);
        if (data.aiSummary) setAiSummary(data.aiSummary);
      }
    });
    return () => unsubscribe();
  }, [coupleId, today, user]);

  const saveReflection = async () => {
    if (!user || !today || !coupleId || !myReflection.trim()) return;
    setIsSaving(true);
    try {
      const reflectionRef = doc(db, 'reflections', `${coupleId}_day${today.day}`);
      const userName = user.email?.split('@')[0] || 'Friend';
      await setDoc(reflectionRef, {
        [user.uid]: { text: myReflection.trim(), submittedAt: new Date().toISOString(), userName },
      }, { merge: true });
    } catch (e) {
      Alert.alert('Error', 'Could not save your reflection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAISummary = async () => {
    if (!savedReflection || !partnerReflection || !coupleId || !today) return;
    setIsGeneratingSummary(true);
    try {
      const prompt = today.theme.includes('Rest')
        ? `Two Christian partners completed a week of Lent devotionals. Here are their weekly reflections:
Partner 1 (${savedReflection.userName}): "${savedReflection.text}"
Partner 2 (${partnerReflection.userName}): "${partnerReflection.text}"
This is a rest/reflection day. Please:
1. Write 2-3 sentences summarizing what they have in common spiritually this week
2. Generate 4 deeper discussion questions to help them grow together
Respond ONLY as JSON: {"commonGround": "...", "questions": ["...", "...", "...", "..."]}`
        : `Two Christian partners reflected on today's Lent devotional.
Theme: ${today.theme}
Verse: ${today.verse}
Prompt: ${today.prompt}
Partner 1 (${savedReflection.userName}): "${savedReflection.text}"
Partner 2 (${partnerReflection.userName}): "${partnerReflection.text}"
Please:
1. Write 2-3 sentences about what they have in common spiritually
2. Generate 3 discussion questions to help them go deeper together
Respond ONLY as JSON: {"commonGround": "...", "questions": ["...", "...", "..."]}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
      });
      const data = await response.json();
      const parsed: AISummary = JSON.parse(data.choices[0].message.content);
      const reflectionRef = doc(db, 'reflections', `${coupleId}_day${today.day}`);
      await setDoc(reflectionRef, { aiSummary: parsed }, { merge: true });
      setAiSummary(parsed);
    } catch (e) {
      Alert.alert('Error', 'Could not generate summary. Please try again.');
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

  const bothSubmitted = !!savedReflection && !!partnerReflection;

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

        {/* Verse block — editorial pull quote style */}
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
              {new Date(savedReflection.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <View style={[styles.card, savedReflection && styles.cardSaved]}>
          {savedReflection ? (
            <Text style={styles.savedText}>{savedReflection.text}</Text>
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
                {isSaving ? <ActivityIndicator color="#FFF8F0" /> : <Text style={styles.buttonText}>Save Reflection</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Partner's Reflection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Partner's Reflection</Text>
          {partnerReflection && <Text style={styles.partnerName}>{partnerReflection.userName}</Text>}
        </View>

        <View style={[styles.card, styles.partnerCard]}>
          {partnerReflection ? (
            <Text style={styles.savedText}>{partnerReflection.text}</Text>
          ) : (
            <View style={styles.waitingRow}>
              <View style={styles.waitingDot} />
              <Text style={styles.waitingText}>Waiting for your partner...</Text>
            </View>
          )}
        </View>

        {/* AI Summary */}
        {bothSubmitted && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerSymbol}>✦</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {today.theme.includes('Rest') ? 'Weekly Summary' : "Today's Summary"}
              </Text>
              {aiSummary ? (
                <>
                  <Text style={styles.summaryLabel}>What you share</Text>
                  <Text style={styles.summaryText}>{aiSummary.commonGround}</Text>
                  <Text style={styles.summaryLabel}>Discuss together</Text>
                  {aiSummary.questions.map((q, i) => (
                    <View key={i} style={styles.questionRow}>
                      <Text style={styles.questionNumber}>{i + 1}</Text>
                      <Text style={styles.questionText}>{q}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <TouchableOpacity style={styles.button} onPress={generateAISummary} disabled={isGeneratingSummary}>
                  {isGeneratingSummary
                    ? <ActivityIndicator color="#FFF8F0" />
                    : <Text style={styles.buttonText}>{today.theme.includes('Rest') ? 'Generate Weekly Summary' : 'Generate Summary'}</Text>
                  }
                </TouchableOpacity>
              )}
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

  // Day + Theme
  dayTagRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, marginBottom: 20, gap: 10 },
  dayTag: { backgroundColor: '#A0522D', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dayTagText: { color: '#FFF8F0', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  themeText: { fontSize: 14, color: '#6B4C35', fontWeight: '500', flex: 1 },

  // Verse block
  verseBlock: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24, backgroundColor: '#FDF3E7', borderRadius: 16, overflow: 'hidden' },
  verseAccent: { width: 4, backgroundColor: '#A0522D', borderRadius: 4 },
  verseContent: { flex: 1, padding: 16 },
  verseRef: { fontSize: 12, fontWeight: '700', color: '#A0522D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  verseFullText: { fontSize: 16, lineHeight: 26, color: '#3D2B1F', fontStyle: 'italic' },

  // Prompt
  promptBlock: { paddingHorizontal: 20, marginBottom: 24 },
  promptLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  promptText: { fontSize: 17, lineHeight: 28, color: '#3D2B1F', fontWeight: '500' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  // Section headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#3D2B1F', letterSpacing: 0.3 },
  savedAt: { fontSize: 11, color: '#A0522D', opacity: 0.7 },
  partnerName: { fontSize: 11, color: '#A0522D', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Cards
  card: {
    marginHorizontal: 20, marginBottom: 24, borderRadius: 18, padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  cardSaved: { backgroundColor: '#FFFDF9' },
  partnerCard: { backgroundColor: '#FDF9F5', borderColor: '#E8D9C5' },
  savedText: { fontSize: 15, lineHeight: 26, color: '#3D2B1F' },

  // Input
  input: { minHeight: 130, fontSize: 15, lineHeight: 26, color: '#3D2B1F', padding: 0, marginBottom: 16 },

  // Waiting
  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  waitingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D4B896' },
  waitingText: { fontSize: 14, color: '#8B6347', fontStyle: 'italic' },

  // Button
  button: { backgroundColor: '#A0522D', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

  // Summary
  summaryCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 20,
    backgroundColor: '#FDF3E7',
    borderWidth: 1.5, borderColor: '#C8956C',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#3D2B1F', marginBottom: 16 },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginTop: 14 },
  summaryText: { fontSize: 15, lineHeight: 26, color: '#3D2B1F' },
  questionRow: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  questionNumber: { fontSize: 13, fontWeight: '800', color: '#A0522D', width: 18, marginTop: 2 },
  questionText: { fontSize: 15, lineHeight: 24, color: '#5C4033', fontStyle: 'italic', flex: 1 },
});