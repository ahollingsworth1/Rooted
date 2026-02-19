import RootedHeader from '@/components/RootedHeader';
import { getTodayLentDay } from '@/constants/lentPlan';
import { auth, db } from '@/lib/firebase';
import { router } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  coupleId: string;
  inviteCode?: string;
  partnerId?: string;
}

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [partnerData, setPartnerData] = useState<UserData | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completedDays, setCompletedDays] = useState(0);

  const user = auth.currentUser;
  const today = getTodayLentDay();

  useEffect(() => {
    if (!user) {
      router.replace('/welcome');
      return;
    }
    loadUserData();
  }, [user]);

  const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      let data: UserData;

      if (!userDoc.exists()) {
        const code = generateInviteCode();
        data = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Friend',
          coupleId: user.uid,
          inviteCode: code,
        };
        await setDoc(userRef, data);
      } else {
        data = userDoc.data() as UserData;
        if (!data.inviteCode) {
          const code = generateInviteCode();
          await updateDoc(userRef, { inviteCode: code });
          data.inviteCode = code;
        }
      }
      setUserData(data);

      if (data.partnerId) {
        const partnerDoc = await getDoc(doc(db, 'users', data.partnerId));
        if (partnerDoc.exists()) {
          const partner = partnerDoc.data() as UserData;
          setPartnerData(partner);
          await calculateStreak(data.coupleId, data.uid, data.partnerId);
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async (coupleId: string, userId: string, partnerId: string) => {
    if (!today) return;
    let currentStreak = 0;
    let totalCompleted = 0;

    for (let day = today.day; day >= 1; day--) {
      const ref = doc(db, 'reflections', `${coupleId}_day${day}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const bothDone = !!data[userId] && !!data[partnerId];
        if (bothDone) {
          totalCompleted++;
          if (day >= today.day - currentStreak) currentStreak++;
        } else if (day < today.day) {
          break;
        }
      } else if (day < today.day) {
        break;
      }
    }
    setStreak(currentStreak);
    setCompletedDays(totalCompleted);
  };

  const shareInviteCode = async () => {
    if (!userData?.inviteCode) return;
    await Share.share({
      message: `Join me on Rooted for our Lent devotional! Use my invite code: ${userData.inviteCode}`,
    });
  };

  const linkWithPartner = async () => {
    if (!user || !userData || !inviteCode.trim()) return;
    setLinking(true);
    try {
      const code = inviteCode.trim().toUpperCase();
      const q = query(collection(db, 'users'), where('inviteCode', '==', code));
      const results = await getDocs(q);

      if (results.empty) {
        Alert.alert('Code not found', "That invite code doesn't match any account. Double-check with your partner!");
        return;
      }

      const partnerDoc = results.docs[0];
      const partner = partnerDoc.data() as UserData;

      if (partner.uid === user.uid) {
        Alert.alert('Oops!', "That's your own invite code!");
        return;
      }

      const coupleId = [user.uid, partner.uid].sort().join('_');
      await updateDoc(doc(db, 'users', user.uid), { coupleId, partnerId: partner.uid });
      await updateDoc(doc(db, 'users', partner.uid), { coupleId, partnerId: user.uid });

      setPartnerData(partner);
      setUserData(prev => prev ? { ...prev, coupleId, partnerId: partner.uid } : prev);
      Alert.alert('Connected!', `You're now linked with ${partner.displayName}!`);
    } catch (e) {
      Alert.alert('Error', 'Could not link accounts. Please try again.');
    } finally {
      setLinking(false);
      setInviteCode('');
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.replace('/welcome');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A0522D" size="large" />
      </View>
    );
  }

  const progressPercent = today ? Math.round((completedDays / 40) * 100) : 0;
  const flameEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '🕯️' : '✦';
  const daysLeft = today ? 40 - today.day + 1 : 40;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <RootedHeader subtitle="40 Days Together" />

      {/* Greeting block */}
      <View style={styles.greetingBlock}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.displayName} </Text>
          {today
            ? <Text style={styles.greetingSub}>Day {today.day} of Lent · {daysLeft} days remaining</Text>
            : <Text style={styles.greetingSub}>Lent begins soon</Text>
          }
        </View>
      </View>

      {/* Streak + Progress — only shown when partner is linked */}
      {partnerData && (
        <View style={styles.streakCard}>
          {/* Top row */}
          <View style={styles.streakTopRow}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakSectionLabel}>Together Streak</Text>
              <View style={styles.streakNumberRow}>
                <Text style={styles.flameIcon}>{flameEmoji}</Text>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakUnit}>{streak === 1 ? 'day' : 'days'}</Text>
              </View>
            </View>
            <View style={styles.streakDividerV} />
            <View style={styles.streakRight}>
              <Text style={styles.streakSectionLabel}>Completed</Text>
              <Text style={styles.completedNumber}>{completedDays}</Text>
              <Text style={styles.completedOf}>of 40 days</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]}>
                <View style={styles.progressGlow} />
              </View>
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {progressPercent === 0 ? 'Begin your journey' : `${progressPercent}% complete`}
              </Text>
              <Text style={styles.progressLabel}>Easter</Text>
            </View>
          </View>

          {/* Streak message */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                {streak >= 7
                  ? `${streak} days strong — you're on fire!`
                  : streak >= 3
                  ? `${streak} days in a row — keep going!`
                  : `Great start — ${streak} day streak!`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Today's card */}
      {today && (
        <TouchableOpacity style={styles.todayCard} onPress={() => router.push('/(tabs)/reflect')} activeOpacity={0.85}>
          <View style={styles.todayCardInner}>
            <View style={styles.todayLeft}>
              <Text style={styles.todayLabel}>Today</Text>
              <Text style={styles.todayTheme}>{today.theme}</Text>
              <Text style={styles.todayVerse}>{today.verse}</Text>
            </View>
            <View style={styles.todayArrowBox}>
              <Text style={styles.todayArrow}>›</Text>
            </View>
          </View>
          <View style={styles.todayAccent} />
        </TouchableOpacity>
      )}

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Partner section */}
      {partnerData ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your Partner</Text>
          <View style={styles.partnerRow}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerAvatarText}>{partnerData.displayName[0].toUpperCase()}</Text>
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partnerData.displayName}</Text>
              <Text style={styles.partnerEmail}>{partnerData.email}</Text>
            </View>
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Linked</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Connect with your partner</Text>
          <Text style={styles.cardSubtitle}>Share your code or enter theirs to start tracking your journey together.</Text>

          <Text style={styles.inputLabel}>Your invite code</Text>
          <TouchableOpacity style={styles.codeBox} onPress={shareInviteCode}>
            <Text style={styles.codeText}>{userData?.inviteCode}</Text>
            <Text style={styles.shareHint}>Tap to share via iMessage</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Enter partner's code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. AB12CD"
            placeholderTextColor="#C4A882"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, (!inviteCode.trim() || linking) && styles.buttonDisabled]}
            onPress={linkWithPartner}
            disabled={!inviteCode.trim() || linking}
          >
            {linking ? <ActivityIndicator color="#FFF8F0" /> : <Text style={styles.buttonText}>Link Accounts</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Quick nav */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.sectionLabel}>Quick Access</Text>
      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/reflect')}>
          <Text style={styles.quickCardTitle}>Reflect</Text>
          <Text style={styles.quickCardSub}>Today's prompt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/bible-study')}>
          <Text style={styles.quickCardTitle}>40-Day Plan</Text>
          <Text style={styles.quickCardSub}>All readings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { backgroundColor: '#FAF6F0', paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' },

  // Greeting
  greetingBlock: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#3D2B1F', letterSpacing: -0.5 },
  greetingSub: { fontSize: 14, color: '#8B6347', marginTop: 4 },

  // Streak card
  streakCard: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 22, padding: 22,
    backgroundColor: '#FDF3E7', borderWidth: 1.5, borderColor: '#C8956C',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4,
  },
  streakTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  streakLeft: { flex: 1 },
  streakRight: { flex: 1, alignItems: 'flex-end' },
  streakDividerV: { width: 1, height: 60, backgroundColor: '#E8D9C5', marginHorizontal: 16 },
  streakSectionLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  streakNumberRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  flameIcon: { fontSize: 28, marginRight: 2 },
  streakNumber: { fontSize: 44, fontWeight: '800', color: '#6B3A2A', lineHeight: 48 },
  streakUnit: { fontSize: 15, color: '#8B6347', marginBottom: 6, fontWeight: '500' },
  completedNumber: { fontSize: 44, fontWeight: '800', color: '#6B3A2A', lineHeight: 48 },
  completedOf: { fontSize: 13, color: '#8B6347', marginTop: 2 },

  // Progress bar
  progressSection: { marginBottom: 12 },
  progressTrack: { height: 10, backgroundColor: '#EDE0D4', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#A0522D', borderRadius: 5, minWidth: 8 },
  progressGlow: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 20, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, color: '#8B6347' },
  streakBadge: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  streakBadgeText: { fontSize: 13, color: '#6B3A2A', fontStyle: 'italic' },

  // Today's card
  todayCard: {
    marginHorizontal: 20, marginBottom: 8, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  todayCardInner: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  todayLeft: { flex: 1 },
  todayLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  todayTheme: { fontSize: 17, fontWeight: '700', color: '#3D2B1F', marginBottom: 4 },
  todayVerse: { fontSize: 13, color: '#8B6347' },
  todayArrowBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FDF3E7', alignItems: 'center', justifyContent: 'center' },
  todayArrow: { fontSize: 22, color: '#A0522D', fontWeight: '300' },
  todayAccent: { height: 4, backgroundColor: '#A0522D' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  // Card
  card: {
    marginHorizontal: 20, borderRadius: 18, padding: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#3D2B1F', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#8B6347', marginBottom: 20, lineHeight: 22 },

  // Partner
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FDF3E7', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#C8956C' },
  partnerAvatarText: { fontSize: 20, fontWeight: '700', color: '#A0522D' },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '700', color: '#3D2B1F' },
  partnerEmail: { fontSize: 12, color: '#8B6347', marginTop: 2 },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  connectedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#5C8A5C' },
  connectedText: { fontSize: 12, color: '#5C8A5C', fontWeight: '600' },

  // Invite
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  codeBox: { backgroundColor: '#FDF3E7', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#C8956C', borderStyle: 'dashed' },
  codeText: { fontSize: 30, fontWeight: '800', color: '#6B3A2A', letterSpacing: 8 },
  shareHint: { fontSize: 11, color: '#A0522D', marginTop: 6, opacity: 0.7 },
  input: { backgroundColor: '#FAF6F0', borderRadius: 12, padding: 14, fontSize: 20, fontWeight: '700', color: '#3D2B1F', marginBottom: 14, borderWidth: 1, borderColor: '#EDE0D4', textAlign: 'center', letterSpacing: 6 },
  button: { backgroundColor: '#A0522D', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

  // Quick access
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingHorizontal: 20 },
  quickRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20 },
  quickCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#EDE0D4', alignItems: 'center', shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quickCardIcon: { fontSize: 28, marginBottom: 8 },
  quickCardTitle: { fontSize: 14, fontWeight: '700', color: '#3D2B1F', marginBottom: 4 },
  quickCardSub: { fontSize: 12, color: '#8B6347', textAlign: 'center' },

  signOutBtn: { alignItems: 'center', marginTop: 36 },
  signOutText: { fontSize: 14, color: '#A0522D', opacity: 0.5 },
});