import { getPathwayById, Pathway } from '@/constants/pathways';
import { auth, db } from '@/lib/firebase';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PathwayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('your partner');
  const [activePathwayId, setActivePathwayId] = useState<string | null>(null);
  const [pendingPathwayId, setPendingPathwayId] = useState<string | null>(null);
  const [proposedBy, setProposedBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;
    const found = getPathwayById(id);
    setPathway(found || null);
    loadCoupleData();
  }, [id]);

  const loadCoupleData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cId = userData.coupleId || user.uid;
        const pId = userData.partnerId || null;
        setCoupleId(cId);
        setPartnerId(pId);

        if (pId) {
          const partnerDoc = await getDoc(doc(db, 'users', pId));
          if (partnerDoc.exists()) {
            setPartnerName(partnerDoc.data().displayName?.split(' ')[0] || 'your partner');
          }
        }

        if (cId !== user.uid) {
          const coupleDoc = await getDoc(doc(db, 'couples', cId));
          if (coupleDoc.exists()) {
            const cd = coupleDoc.data();
            setActivePathwayId(cd.activePathwayId || null);
            setPendingPathwayId(cd.pendingPathwayId || null);
            setProposedBy(cd.proposedBy || null);
          }
        }
      }
    } catch (e) {
      console.error('Error loading couple data:', e);
    } finally {
      setLoading(false);
    }
  };

  const sendProposal = async () => {
    if (!coupleId || !user || !pathway) return;

    if (!partnerId) {
      Alert.alert(
        'No Partner Linked',
        'Link with your partner first from the Home tab.',
      );
      return;
    }

    setProposing(true);
    try {
      await updateDoc(doc(db, 'couples', coupleId), {
        pendingPathwayId: pathway.id,
        proposedBy: user.uid,
        activePathwayId: null,
        activePathwayDay: 0,
        startedAt: null,
      });

      // Send push notification to partner
      await sendPushNotification(partnerId, pathway);

      Alert.alert(
        'Proposal Sent! 🌿',
        `${partnerName} has been notified and can accept in the Journeys tab.`,
        [{ text: 'Back to Journeys', onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert('Error', 'Could not send proposal. Please try again.');
    } finally {
      setProposing(false);
    }
  };

  const sendPushNotification = async (recipientId: string, p: Pathway) => {
    try {
      const recipientDoc = await getDoc(doc(db, 'users', recipientId));
      if (!recipientDoc.exists()) return;
      const token = recipientDoc.data().expoPushToken;
      if (!token) return;

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: `${user?.displayName?.split(' ')[0] || 'Your partner'} wants to start a journey`,
          body: `"${p.title}" — ${p.duration} days ${p.icon}. Open Rooted to accept.`,
          data: { screen: 'pathways' },
          sound: 'default',
        }),
      });
    } catch (e) {
      // Non-fatal — proposal still sent even if notification fails
      console.log('Push notification failed (non-fatal):', e);
    }
  };

  if (loading || !pathway) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A0522D" size="large" />
      </View>
    );
  }

  const isActive = pathway.id === activePathwayId;
  const isPending = pathway.id === pendingPathwayId;
  const isProposer = proposedBy === user?.uid;
  const sampleDays = pathway.days.slice(0, 5);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: pathway.color }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heroIcon}>{pathway.icon}</Text>
        <Text style={styles.heroTitle}>{pathway.title}</Text>
        <Text style={styles.heroSubtitle}>{pathway.subtitle}</Text>
        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>{pathway.duration} days</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descText}>{pathway.description}</Text>
        </View>

        {/* Status banners */}
        {isActive && (
          <View style={[styles.statusBanner, { backgroundColor: pathway.color + '20', borderColor: pathway.color }]}>
            <Text style={[styles.statusBannerText, { color: pathway.color }]}>
              ✓ This is your current active journey
            </Text>
          </View>
        )}
        {isPending && isProposer && (
          <View style={styles.waitingBanner}>
            <Text style={styles.waitingBannerText}>
              ⏳ Waiting for {partnerName} to accept this proposal...
            </Text>
          </View>
        )}
        {isPending && !isProposer && (
          <View style={[styles.statusBanner, { backgroundColor: '#FDF3E7', borderColor: '#C8956C' }]}>
            <Text style={styles.statusBannerText}>
              {partnerName} has proposed this journey — accept it in the Journeys tab
            </Text>
          </View>
        )}

        {/* What you'll explore */}
        <Text style={styles.sectionLabel}>What You'll Explore</Text>
        <View style={styles.previewCard}>
          {sampleDays.map((day, i) => (
            <View key={i} style={[styles.previewRow, i < sampleDays.length - 1 && styles.previewRowBorder]}>
              <View style={[styles.previewDayBadge, { backgroundColor: pathway.color }]}>
                <Text style={styles.previewDayText}>{day.day}</Text>
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewTheme}>{day.theme}</Text>
                <Text style={styles.previewVerse}>{day.verse}</Text>
              </View>
            </View>
          ))}
          <View style={styles.previewMore}>
            <Text style={styles.previewMoreText}>+ {pathway.duration - 5} more days</Text>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionLabel}>How It Works</Text>
        <View style={styles.howCard}>
          {[
            { icon: '🌿', step: 'Both of you accept the journey' },
            { icon: '📖', step: 'Each day, read the devotional together or separately' },
            { icon: '✍️', step: 'Write your own reflection privately' },
            { icon: '✦', step: 'Once both submit, AI reveals what you have in common' },
            { icon: '💬', step: 'Use the discussion questions to go deeper together' },
          ].map((item, i) => (
            <View key={i} style={[styles.howRow, i < 4 && styles.howRowBorder]}>
              <Text style={styles.howIcon}>{item.icon}</Text>
              <Text style={styles.howText}>{item.step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      {!isActive && !isProposer && (
        <View style={styles.ctaContainer}>
          {isPending && !isProposer ? (
            <View style={[styles.ctaBtn, { backgroundColor: '#C8956C', opacity: 0.7 }]}>
              <Text style={styles.ctaBtnText}>Waiting for {partnerName}...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: pathway.color }]}
              onPress={sendProposal}
              disabled={proposing}
              activeOpacity={0.85}
            >
              {proposing ? (
                <ActivityIndicator color="#FFF8F0" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>
                    Propose to {partnerName} {pathway.icon}
                  </Text>
                  <Text style={styles.ctaBtnSub}>
                    {partnerName} will get a notification to accept
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {isActive && (
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: pathway.color }]}
            onPress={() => router.push('/(tabs)/reflect')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Continue Journey →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' },

  hero: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20 },
  backText: { color: '#FFF8F0', fontSize: 15, fontWeight: '600', opacity: 0.9 },
  heroIcon: { fontSize: 52, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFF8F0', textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { fontSize: 15, color: '#FFF8F0', opacity: 0.85, textAlign: 'center', fontStyle: 'italic', marginBottom: 16 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  heroPillText: { color: '#FFF8F0', fontWeight: '700', fontSize: 13 },

  body: { flex: 1 },
  bodyContent: { padding: 20 },

  descCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#EDE0D4', marginBottom: 16,
  },
  descText: { fontSize: 15, lineHeight: 26, color: '#3D2B1F' },

  statusBanner: {
    borderRadius: 12, padding: 14, borderWidth: 1.5, marginBottom: 16,
  },
  statusBannerText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  waitingBanner: {
    backgroundColor: '#FDF9F5', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E8D9C5', marginBottom: 16,
  },
  waitingBannerText: { fontSize: 13, color: '#6B4C35', textAlign: 'center', fontStyle: 'italic' },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#A0522D',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginTop: 4,
  },

  previewCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#EDE0D4', marginBottom: 20,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  previewRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5EDE4' },
  previewDayBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  previewDayText: { color: '#FFF8F0', fontSize: 12, fontWeight: '700' },
  previewContent: { flex: 1 },
  previewTheme: { fontSize: 14, fontWeight: '700', color: '#3D2B1F', marginBottom: 2 },
  previewVerse: { fontSize: 12, color: '#8B6347', fontStyle: 'italic' },
  previewMore: { padding: 14, alignItems: 'center', backgroundColor: '#FDF9F5' },
  previewMoreText: { fontSize: 13, color: '#A0522D', fontWeight: '600' },

  howCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#EDE0D4', marginBottom: 20,
  },
  howRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  howRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5EDE4' },
  howIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  howText: { fontSize: 14, color: '#3D2B1F', lineHeight: 22, flex: 1 },

  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: '#FAF6F0',
    borderTopWidth: 1, borderTopColor: '#EDE0D4',
  },
  ctaBtn: {
    borderRadius: 18, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  ctaBtnText: { color: '#FFF8F0', fontWeight: '800', fontSize: 16 },
  ctaBtnSub: { color: '#FFF8F0', opacity: 0.8, fontSize: 12, marginTop: 3 },
});