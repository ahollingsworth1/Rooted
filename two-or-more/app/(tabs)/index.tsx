import RootedHeader from '@/components/RootedHeader';
import { getPathwayById } from '@/constants/pathways';
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
  const [activePathwayId, setActivePathwayId] = useState<string | null>(null);
  const [activePathwayDay, setActivePathwayDay] = useState(0);
  const [streak, setStreak] = useState(0);

  const user = auth.currentUser;

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

      // Load partner data
      if (data.partnerId) {
        const partnerDoc = await getDoc(doc(db, 'users', data.partnerId));
        if (partnerDoc.exists()) setPartnerData(partnerDoc.data() as UserData);
      }

      // Load couple/pathway data
      if (data.coupleId && data.coupleId !== user.uid) {
        const coupleDoc = await getDoc(doc(db, 'couples', data.coupleId));
        if (coupleDoc.exists()) {
          const coupleData = coupleDoc.data();
          setActivePathwayId(coupleData.activePathwayId || null);
          setActivePathwayDay(coupleData.activePathwayDay || 0);
        }

        // Calculate streak
        let streakCount = 0;
        let day = activePathwayDay;
        while (day > 0) {
          const reflectionDoc = await getDoc(doc(db, 'reflections', `${data.coupleId}_day${day}`));
          if (reflectionDoc.exists() && reflectionDoc.data()[user.uid]) {
            streakCount++;
            day--;
          } else break;
        }
        setStreak(streakCount);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
  };

  const linkPartner = async () => {
    if (!inviteCode.trim() || !user || !userData) return;
    setLinking(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('inviteCode', '==', inviteCode.trim().toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('Not Found', 'No user found with that invite code. Double-check and try again.');
        return;
      }

      const partnerDoc = snapshot.docs[0];
      const partner = partnerDoc.data() as UserData;

      if (partner.uid === user.uid) {
        Alert.alert('Oops', "That's your own invite code!");
        return;
      }

      // Create combined coupleId (sorted so both users get same ID)
      const ids = [user.uid, partner.uid].sort();
      const newCoupleId = `${ids[0]}_${ids[1]}`;

      // Update both users
      await updateDoc(doc(db, 'users', user.uid), {
        coupleId: newCoupleId,
        partnerId: partner.uid,
      });
      await updateDoc(doc(db, 'users', partner.uid), {
        coupleId: newCoupleId,
        partnerId: user.uid,
      });

      // Create couple document
      await setDoc(doc(db, 'couples', newCoupleId), {
        members: [user.uid, partner.uid],
        createdAt: new Date().toISOString(),
        activePathwayId: null,
        activePathwayDay: 0,
        pendingPathwayId: null,
        proposedBy: null,
      });

      Alert.alert('Connected! 🎉', `You are now linked with ${partner.displayName}. Head to the Journeys tab to choose a pathway together!`);
      loadUserData();
    } catch (e) {
      Alert.alert('Error', 'Could not link accounts. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A0522D" size="large" />
      </View>
    );
  }

  const activePathway = activePathwayId ? getPathwayById(activePathwayId) : null;
  const isLinked = userData?.partnerId && partnerData;
  const firstName = userData?.displayName?.split(' ')[0] || 'Friend';
  const progress = activePathway ? activePathwayDay / activePathway.duration : 0;
  const flameIcon = streak >= 7 ? '🔥' : streak >= 3 ? '🕯️' : '✦';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <RootedHeader />

      {/* Greeting */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>Good morning, {firstName} ✦</Text>
        {activePathway ? (
          <Text style={styles.greetingSub}>Day {activePathwayDay} of {activePathway.title}</Text>
        ) : (
          <Text style={styles.greetingSub}>Choose a journey to begin</Text>
        )}
      </View>

      {/* Streak + Progress */}
      {activePathway && (
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakIcon}>{flameIcon}</Text>
              <View>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakRight}>
              <Text style={styles.streakNumber}>{activePathwayDay}</Text>
              <Text style={styles.streakLabel}>of {activePathway.duration} days</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` as any, backgroundColor: activePathway.color }]} />
          </View>

          <Text style={styles.progressLabel}>
            {activePathway.duration - activePathwayDay} days remaining in {activePathway.title}
          </Text>
        </View>
      )}

      {/* Today's card */}
      {activePathway && activePathwayDay > 0 && (
        <TouchableOpacity style={styles.todayCard} onPress={() => router.push('/(tabs)/reflect')} activeOpacity={0.85}>
          <View style={styles.todayTop}>
            <View style={[styles.todayDayPill, { backgroundColor: activePathway.color }]}>
              <Text style={styles.todayDayText}>{activePathway.icon} Day {activePathwayDay}</Text>
            </View>
            <Text style={styles.todayArrow}>→</Text>
          </View>
          <Text style={styles.todayTheme}>{activePathway.days[activePathwayDay - 1]?.theme}</Text>
          <Text style={styles.todayVerse}>{activePathway.days[activePathwayDay - 1]?.verse}</Text>
          <View style={[styles.todayAccent, { backgroundColor: activePathway.color }]} />
        </TouchableOpacity>
      )}

      {/* No pathway state */}
      {!activePathway && isLinked && (
        <TouchableOpacity style={styles.startCard} onPress={() => router.push('/(tabs)/pathways')} activeOpacity={0.85}>
          <Text style={styles.startCardIcon}>🌿</Text>
          <View style={styles.startCardText}>
            <Text style={styles.startCardTitle}>Begin Your Journey</Text>
            <Text style={styles.startCardSub}>Choose a pathway and invite your partner to start together</Text>
          </View>
          <Text style={styles.startCardArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Quick actions */}
      {activePathway && (
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/reflect')} activeOpacity={0.85}>
            <Text style={styles.quickIcon}>✍️</Text>
            <Text style={styles.quickLabel}>Reflect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/pathways')} activeOpacity={0.85}>
            <Text style={styles.quickIcon}>🌿</Text>
            <Text style={styles.quickLabel}>Journeys</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Partner section */}
      <Text style={styles.sectionLabel}>Your Partner</Text>

      {isLinked ? (
        <View style={styles.partnerCard}>
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerAvatarText}>
              {partnerData.displayName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>{partnerData.displayName}</Text>
            <Text style={styles.partnerEmail}>{partnerData.email}</Text>
          </View>
          <View style={styles.linkedBadge}>
            <View style={styles.linkedDot} />
            <Text style={styles.linkedText}>Linked</Text>
          </View>
        </View>
      ) : (
        <View style={styles.linkCard}>
          <Text style={styles.linkTitle}>Connect with Your Partner</Text>
          <Text style={styles.linkSub}>Share your invite code or enter theirs to begin your journey together.</Text>

          {userData?.inviteCode && (
            <TouchableOpacity
              style={styles.inviteCodeBox}
              onPress={() => Share.share({ message: `Join me on Rooted! Use code: ${userData.inviteCode}` })}
            >
              <Text style={styles.inviteCodeLabel}>Your Invite Code</Text>
              <Text style={styles.inviteCode}>{userData.inviteCode}</Text>
              <Text style={styles.inviteCodeTap}>Tap to share ↗</Text>
            </TouchableOpacity>
          )}

          <TextInput
            style={styles.codeInput}
            placeholder="Enter partner's code"
            placeholderTextColor="#C4A882"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.linkBtn, !inviteCode.trim() && styles.linkBtnDisabled]}
            onPress={linkPartner}
            disabled={!inviteCode.trim() || linking}
          >
            {linking ? <ActivityIndicator color="#FFF8F0" /> : <Text style={styles.linkBtnText}>Connect</Text>}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' },

  greetingBlock: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#3D2B1F', letterSpacing: -0.5 },
  greetingSub: { fontSize: 14, color: '#8B6347', marginTop: 4 },

  streakCard: {
    marginHorizontal: 20, marginBottom: 16, padding: 18, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  streakLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakIcon: { fontSize: 28 },
  streakNumber: { fontSize: 28, fontWeight: '800', color: '#3D2B1F' },
  streakLabel: { fontSize: 12, color: '#8B6347', fontWeight: '500' },
  streakDivider: { width: 1, height: 40, backgroundColor: '#E8D9C5', marginHorizontal: 16 },
  streakRight: { flex: 1, alignItems: 'center' },
  progressTrack: { height: 6, backgroundColor: '#EDE0D4', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: '#8B6347' },

  todayCard: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
    padding: 18,
  },
  todayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  todayDayPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  todayDayText: { color: '#FFF8F0', fontSize: 12, fontWeight: '700' },
  todayArrow: { fontSize: 18, color: '#C4A882' },
  todayTheme: { fontSize: 20, fontWeight: '800', color: '#3D2B1F', marginBottom: 4 },
  todayVerse: { fontSize: 13, color: '#8B6347', fontStyle: 'italic', marginBottom: 14 },
  todayAccent: { height: 4, borderRadius: 2, marginTop: 4 },

  startCard: {
    marginHorizontal: 20, marginBottom: 16, padding: 18, borderRadius: 20,
    backgroundColor: '#FDF3E7', borderWidth: 1.5, borderColor: '#C8956C',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  startCardIcon: { fontSize: 32 },
  startCardText: { flex: 1 },
  startCardTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F', marginBottom: 3 },
  startCardSub: { fontSize: 13, color: '#8B6347', lineHeight: 20 },
  startCardArrow: { fontSize: 18, color: '#A0522D' },

  quickRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 20 },
  quickCard: {
    flex: 1, padding: 18, borderRadius: 18, alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 1,
  },
  quickIcon: { fontSize: 26, marginBottom: 6 },
  quickLabel: { fontSize: 13, fontWeight: '700', color: '#3D2B1F' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingHorizontal: 20 },

  partnerCard: {
    marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 18,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 1,
  },
  partnerAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#A0522D', justifyContent: 'center', alignItems: 'center',
  },
  partnerAvatarText: { color: '#FFF8F0', fontWeight: '700', fontSize: 18 },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#3D2B1F' },
  partnerEmail: { fontSize: 12, color: '#8B6347', marginTop: 2 },
  linkedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EAF4EA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  linkedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5C8A5C' },
  linkedText: { fontSize: 11, fontWeight: '700', color: '#3D6B3D' },

  linkCard: {
    marginHorizontal: 20, padding: 20, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  linkTitle: { fontSize: 17, fontWeight: '700', color: '#3D2B1F', marginBottom: 6 },
  linkSub: { fontSize: 14, color: '#8B6347', lineHeight: 22, marginBottom: 20 },
  inviteCodeBox: {
    borderWidth: 1.5, borderColor: '#C8956C', borderStyle: 'dashed', borderRadius: 14,
    padding: 14, alignItems: 'center', marginBottom: 16,
  },
  inviteCodeLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  inviteCode: { fontSize: 28, fontWeight: '800', color: '#3D2B1F', letterSpacing: 4 },
  inviteCodeTap: { fontSize: 11, color: '#A0522D', marginTop: 6, opacity: 0.7 },
  codeInput: {
    borderWidth: 1, borderColor: '#EDE0D4', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#3D2B1F', textAlign: 'center', letterSpacing: 3,
    backgroundColor: '#FDF9F5', marginBottom: 12,
  },
  linkBtn: { backgroundColor: '#A0522D', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  linkBtnDisabled: { opacity: 0.4 },
  linkBtnText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15 },
});