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

  const user = auth.currentUser;
  const today = getTodayLentDay();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    loadUserData();
  }, [user]);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      let userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const code = generateInviteCode();
        const newUser: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.email?.split('@')[0] || 'Friend',
          coupleId: user.uid,
          inviteCode: code,
        };
        await setDoc(userRef, newUser);
        setUserData(newUser);
      } else {
        const data = userDoc.data() as UserData;
        if (!data.inviteCode) {
          const code = generateInviteCode();
          await updateDoc(userRef, { inviteCode: code });
          data.inviteCode = code;
        }
        setUserData(data);

        // Load partner if linked
        if (data.partnerId) {
          const partnerDoc = await getDoc(doc(db, 'users', data.partnerId));
          if (partnerDoc.exists()) {
            setPartnerData(partnerDoc.data() as UserData);
          }
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
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

      // Find partner by invite code
      const q = query(collection(db, 'users'), where('inviteCode', '==', code));
      const results = await getDocs(q);

      if (results.empty) {
        Alert.alert('Code not found', 'That invite code doesn\'t match any account. Double-check with your partner!');
        return;
      }

      const partnerDoc = results.docs[0];
      const partner = partnerDoc.data() as UserData;

      if (partner.uid === user.uid) {
        Alert.alert('Oops!', 'That\'s your own invite code!');
        return;
      }

      // Link both users with a shared coupleId
      const coupleId = [user.uid, partner.uid].sort().join('_');

      await updateDoc(doc(db, 'users', user.uid), {
        coupleId,
        partnerId: partner.uid,
      });
      await updateDoc(doc(db, 'users', partner.uid), {
        coupleId,
        partnerId: user.uid,
      });

      setPartnerData(partner);
      setUserData(prev => prev ? { ...prev, coupleId, partnerId: partner.uid } : prev);
      Alert.alert('Connected!', `You're now linked with ${partner.displayName}. Happy studying together! 🙏`);
    } catch (e) {
      Alert.alert('Error', 'Could not link accounts. Please try again.');
    } finally {
      setLinking(false);
      setInviteCode('');
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A0522D" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <RootedHeader subtitle="40 Days Together" />

      {/* Welcome */}
      <View style={styles.section}>
        <Text style={styles.greeting}>Hello, {userData?.displayName} 👋</Text>
        {today && (
          <View style={styles.dayTag}>
            <Text style={styles.dayTagText}>Day {today.day} of Lent</Text>
          </View>
        )}
      </View>

      {/* Partner Status */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      {partnerData ? (
        // Linked!
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your Partner</Text>
          <View style={styles.partnerRow}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerAvatarText}>
                {partnerData.displayName[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.partnerName}>{partnerData.displayName}</Text>
              <Text style={styles.partnerEmail}>{partnerData.email}</Text>
            </View>
          </View>
          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        </View>
      ) : (
        // Not linked yet
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Connect with your partner</Text>
          <Text style={styles.cardSubtitle}>Share your code or enter theirs to link your accounts.</Text>

          {/* Your code */}
          <Text style={styles.inputLabel}>Your invite code</Text>
          <TouchableOpacity style={styles.codeBox} onPress={shareInviteCode}>
            <Text style={styles.codeText}>{userData?.inviteCode}</Text>
            <Text style={styles.shareHint}>Tap to share</Text>
          </TouchableOpacity>

          {/* Enter partner's code */}
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
            {linking
              ? <ActivityIndicator color="#FFF8F0" />
              : <Text style={styles.buttonText}>Link Accounts</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Quick links */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.sectionLabel}>Jump to</Text>
      <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/reflect')}>
        <Text style={styles.quickLinkTitle}>Today's Reflection</Text>
        <Text style={styles.quickLinkSub}>{today ? `Day ${today.day} • ${today.theme}` : 'Lent hasn\'t started yet'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/bible-study')}>
        <Text style={styles.quickLinkTitle}>40-Day Plan</Text>
        <Text style={styles.quickLinkSub}>View all readings</Text>
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { backgroundColor: '#FAF6F0', paddingBottom: 80 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' },

  section: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 8 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#3D2B1F', marginBottom: 12 },
  dayTag: { alignSelf: 'flex-start', backgroundColor: '#A0522D', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  dayTagText: { color: '#FFF8F0', fontSize: 13, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  card: {
    marginHorizontal: 20, borderRadius: 18, padding: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#3D2B1F', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#8B6347', marginBottom: 20, lineHeight: 20 },

  // Partner linked
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  partnerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FDF3E7', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#C8956C' },
  partnerAvatarText: { fontSize: 20, fontWeight: '700', color: '#A0522D' },
  partnerName: { fontSize: 16, fontWeight: '700', color: '#3D2B1F' },
  partnerEmail: { fontSize: 13, color: '#8B6347', marginTop: 2 },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5C8A5C' },
  connectedText: { fontSize: 13, color: '#5C8A5C', fontWeight: '600' },

  // Invite code
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  codeBox: {
    backgroundColor: '#FDF3E7', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#C8956C',
    borderStyle: 'dashed',
  },
  codeText: { fontSize: 28, fontWeight: '800', color: '#6B3A2A', letterSpacing: 6 },
  shareHint: { fontSize: 11, color: '#A0522D', marginTop: 4, opacity: 0.7 },
  input: {
    backgroundColor: '#FAF6F0', borderRadius: 12, padding: 14,
    fontSize: 18, fontWeight: '700', color: '#3D2B1F', marginBottom: 14,
    borderWidth: 1, borderColor: '#EDE0D4', textAlign: 'center', letterSpacing: 4,
  },
  button: { backgroundColor: '#A0522D', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#FFF8F0', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

  // Quick links
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingHorizontal: 20 },
  quickLink: {
    marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  quickLinkTitle: { fontSize: 15, fontWeight: '600', color: '#3D2B1F' },
  quickLinkSub: { fontSize: 12, color: '#8B6347', marginTop: 2 },

  // Sign out
  signOutBtn: { alignItems: 'center', marginTop: 32 },
  signOutText: { fontSize: 14, color: '#A0522D', opacity: 0.6 },
});