import RootedHeader from '@/components/RootedHeader';
import { PATHWAYS, Pathway } from '@/constants/pathways';
import { auth, db } from '@/lib/firebase';
import { router, useFocusEffect } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PathwaysScreen() {
  const [activePathwayId, setActivePathwayId] = useState<string | null>(null);
  const [pendingPathwayId, setPendingPathwayId] = useState<string | null>(null);
  const [proposedBy, setProposedBy] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const user = auth.currentUser;

  // Reload when returning from pathway detail screen
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCoupleId(data.coupleId || user.uid);
        setPartnerId(data.partnerId || null);

        if (data.coupleId && data.coupleId !== user.uid) {
          const coupleDoc = await getDoc(doc(db, 'couples', data.coupleId));
          if (coupleDoc.exists()) {
            const coupleData = coupleDoc.data();
            setActivePathwayId(coupleData.activePathwayId || null);
            setPendingPathwayId(coupleData.pendingPathwayId || null);
            setProposedBy(coupleData.proposedBy || null);
          }
        }
      }
    } catch (e) {
      console.error('Error loading pathway data:', e);
    } finally {
      setLoading(false);
    }
  };

  const goToDetail = (pathway: Pathway) => {
    router.push(`/pathway/${pathway.id}`);
  };

  const confirmPathway = async () => {
    if (!coupleId || !pendingPathwayId) return;
    setConfirming(true);
    try {
      await updateDoc(doc(db, 'couples', coupleId), {
        activePathwayId: pendingPathwayId,
        pendingPathwayId: null,
        proposedBy: null,
        activePathwayDay: 1,
        startedAt: new Date().toISOString(),
      });
      setActivePathwayId(pendingPathwayId);
      setPendingPathwayId(null);
      setProposedBy(null);
      Alert.alert('Journey Begun! 🌿', 'Your pathway has started. Head to the Reflect tab to begin Day 1.');
    } catch (e) {
      Alert.alert('Error', 'Could not confirm pathway. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const declinePathway = async () => {
    if (!coupleId) return;
    try {
      await updateDoc(doc(db, 'couples', coupleId), {
        pendingPathwayId: null,
        proposedBy: null,
      });
      setPendingPathwayId(null);
      setProposedBy(null);
    } catch (e) {
      console.error('Error declining pathway:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A0522D" size="large" />
      </View>
    );
  }

  const activePathway = PATHWAYS.find(p => p.id === activePathwayId);
  const pendingPathway = PATHWAYS.find(p => p.id === pendingPathwayId);
  const isProposer = proposedBy === user?.uid;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <RootedHeader subtitle="Choose Your Journey" />

      {/* Pending pathway confirmation */}
      {pendingPathway && !isProposer && (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingIcon}>{pendingPathway.icon}</Text>
          <View style={styles.pendingInfo}>
            <Text style={styles.pendingLabel}>Your partner wants to start</Text>
            <Text style={styles.pendingTitle}>{pendingPathway.title}</Text>
            <Text style={styles.pendingDuration}>{pendingPathway.duration} days</Text>
          </View>
          <View style={styles.pendingActions}>
            {confirming ? (
              <ActivityIndicator color="#A0522D" />
            ) : (
              <>
                <TouchableOpacity style={styles.confirmBtn} onPress={confirmPathway}>
                  <Text style={styles.confirmBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={declinePathway}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {pendingPathway && isProposer && (
        <View style={styles.waitingCard}>
          <Text style={styles.waitingCardText}>
            ⏳ Waiting for your partner to accept "{pendingPathway.title}"...
          </Text>
        </View>
      )}

      {/* Active pathway */}
      {activePathway && (
        <>
          <Text style={styles.sectionLabel}>Current Journey</Text>
          <View style={[styles.activeCard, { borderColor: activePathway.color }]}>
            <Text style={styles.activeIcon}>{activePathway.icon}</Text>
            <View style={styles.activeInfo}>
              <Text style={styles.activeTitle}>{activePathway.title}</Text>
              <Text style={styles.activeSub}>{activePathway.subtitle}</Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: activePathway.color }]}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerSymbol}>✦</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      )}

      {/* All pathways */}
      <Text style={styles.sectionLabel}>
        {activePathway ? 'All Journeys' : 'Choose a Journey'}
      </Text>
      <Text style={styles.sectionSub}>
        {activePathway
          ? 'Select a new journey to propose to your partner'
          : 'Select a pathway and invite your partner to begin together'}
      </Text>

      {PATHWAYS.map(pathway => {
        const isActive = pathway.id === activePathwayId;
        const isPending = pathway.id === pendingPathwayId;

        return (
          <TouchableOpacity
            key={pathway.id}
            style={[styles.pathwayCard, isActive && styles.pathwayCardActive]}
            onPress={() => goToDetail(pathway)}
            activeOpacity={0.85}
          >
            <View style={styles.pathwayTop}>
              <Text style={styles.pathwayIcon}>{pathway.icon}</Text>
              <View style={styles.pathwayMeta}>
                <Text style={styles.pathwayDuration}>{pathway.duration} days</Text>
                {isActive && (
                  <View style={[styles.statusPill, { backgroundColor: pathway.color }]}>
                    <Text style={styles.statusPillText}>Active</Text>
                  </View>
                )}
                {isPending && (
                  <View style={styles.pendingPill}>
                    <Text style={styles.pendingPillText}>Pending</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.pathwayTitle}>{pathway.title}</Text>
            <Text style={styles.pathwaySubtitle}>{pathway.subtitle}</Text>
            <Text style={styles.pathwayDesc}>{pathway.description}</Text>

            {!isActive && (
              <View style={[styles.startBtn, { backgroundColor: isPending ? '#C8956C' : pathway.color }]}>
                <Text style={styles.startBtnText}>
                  {isPending && isProposer
                    ? 'Waiting for partner...'
                    : isPending && !isProposer
                    ? 'Accept This Journey →'
                    : 'View Journey →'}
                </Text>
              </View>
            )}

            <View style={[styles.pathwayAccent, { backgroundColor: pathway.color }]} />
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' },

  pendingCard: {
    marginHorizontal: 20, marginBottom: 20, padding: 18, borderRadius: 18,
    backgroundColor: '#FDF3E7', borderWidth: 1.5, borderColor: '#C8956C',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  pendingIcon: { fontSize: 32 },
  pendingInfo: { flex: 1 },
  pendingLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  pendingTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F', marginBottom: 2 },
  pendingDuration: { fontSize: 12, color: '#8B6347' },
  pendingActions: { gap: 8 },
  confirmBtn: { backgroundColor: '#A0522D', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  confirmBtnText: { color: '#FFF8F0', fontWeight: '700', fontSize: 13 },
  declineBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E8D9C5' },
  declineBtnText: { color: '#8B6347', fontWeight: '600', fontSize: 13 },

  waitingCard: {
    marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 14,
    backgroundColor: '#FDF9F5', borderWidth: 1, borderColor: '#E8D9C5',
  },
  waitingCardText: { fontSize: 13, color: '#6B4C35', fontStyle: 'italic' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, paddingHorizontal: 20 },
  sectionSub: { fontSize: 14, color: '#8B6347', marginBottom: 16, paddingHorizontal: 20, lineHeight: 22 },

  activeCard: {
    marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 16,
    backgroundColor: '#FFFFFF', borderWidth: 2,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  activeIcon: { fontSize: 28 },
  activeInfo: { flex: 1 },
  activeTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F' },
  activeSub: { fontSize: 13, color: '#8B6347', marginTop: 2 },
  activeBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeText: { color: '#FFF8F0', fontSize: 11, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  pathwayCard: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  pathwayCardActive: { borderColor: '#A0522D', borderWidth: 2 },
  pathwayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingBottom: 8 },
  pathwayIcon: { fontSize: 32 },
  pathwayMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pathwayDuration: { fontSize: 12, color: '#8B6347', fontWeight: '600' },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusPillText: { color: '#FFF8F0', fontSize: 11, fontWeight: '700' },
  pendingPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#E8D9C5' },
  pendingPillText: { color: '#6B4C35', fontSize: 11, fontWeight: '700' },

  pathwayTitle: { fontSize: 20, fontWeight: '800', color: '#3D2B1F', paddingHorizontal: 18, marginBottom: 2 },
  pathwaySubtitle: { fontSize: 13, color: '#8B6347', fontStyle: 'italic', paddingHorizontal: 18, marginBottom: 10 },
  pathwayDesc: { fontSize: 14, lineHeight: 24, color: '#5C4033', paddingHorizontal: 18, marginBottom: 16 },
  startBtn: { marginHorizontal: 18, marginBottom: 18, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  startBtnText: { color: '#FFF8F0', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },
  pathwayAccent: { height: 4 },
});