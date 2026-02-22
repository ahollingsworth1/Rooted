import RootedHeader from '@/components/RootedHeader';
import { LENT_PLAN, getTodayLentDay } from '@/constants/lentPlan';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BibleStudyScreen() {
  const today = getTodayLentDay();
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      <RootedHeader subtitle="40 Days Together" />

      {/* Today's Reading */}
      {today ? (
        <View style={styles.todaySection}>
          <View style={styles.dayTagRow}>
            <View style={styles.dayTag}>
              <Text style={styles.dayTagText}>Day {today.day}</Text>
            </View>
            <Text style={styles.todayDate}>{todayDate}</Text>
          </View>

          <View style={styles.verseBlock}>
            <View style={styles.verseAccent} />
            <View style={styles.verseContent}>
              <Text style={styles.verseRef}>{today.verse}</Text>
              <Text style={styles.themeText}>{today.theme}</Text>
            </View>
          </View>

          <View style={styles.promptBlock}>
            <Text style={styles.promptLabel}>Reflect Together</Text>
            <Text style={styles.promptText}>{today.prompt}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Lent hasn&apos;t started yet — check back on Ash Wednesday!</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* All 40 Days */}
      <Text style={styles.sectionTitle}>All 40 Days</Text>

      {LENT_PLAN.map((item) => {
        const isToday = today?.day === item.day;
        const isExpanded = expanded === item.day;
        const isPast = today ? item.day < today.day : false;

        return (
          <TouchableOpacity
            key={item.day}
            style={[styles.dayRow, isToday && styles.dayRowActive, isPast && styles.dayRowPast]}
            onPress={() => setExpanded(isExpanded ? null : item.day)}
            activeOpacity={0.7}
          >
            <View style={[styles.dayNumberBox, isToday && styles.dayNumberBoxActive]}>
              <Text style={[styles.dayNumber, isToday && styles.dayNumberActive]}>{item.day}</Text>
            </View>
            <View style={styles.dayInfo}>
              <Text style={[styles.dayTheme, isToday && styles.dayThemeActive]}>{item.theme}</Text>
              <Text style={styles.dayVerse}>{item.verse}</Text>
              {isExpanded && (
                <Text style={styles.dayPrompt}>{item.prompt}</Text>
              )}
            </View>
            {isToday && <View style={styles.todayDot} />}
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { backgroundColor: '#FAF6F0', paddingBottom: 60 },

  // Today section
  todaySection: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 8 },
  dayTagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dayTag: { backgroundColor: '#A0522D', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dayTagText: { color: '#FFF8F0', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  todayDate: { fontSize: 14, color: '#6B4C35', fontWeight: '500' },

  // Verse block
  verseBlock: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#FDF3E7', borderRadius: 16, overflow: 'hidden' },
  verseAccent: { width: 4, backgroundColor: '#A0522D' },
  verseContent: { flex: 1, padding: 16 },
  verseRef: { fontSize: 12, fontWeight: '700', color: '#A0522D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  themeText: { fontSize: 18, fontWeight: '700', color: '#3D2B1F', lineHeight: 26 },

  // Prompt
  promptBlock: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: '#EDE0D4' },
  promptLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  promptText: { fontSize: 16, lineHeight: 26, color: '#3D2B1F', fontStyle: 'italic' },

  // Empty state
  emptyCard: { margin: 20, marginTop: 24, padding: 24, backgroundColor: '#FDF3E7', borderRadius: 16 },
  emptyText: { fontSize: 15, color: '#6B4C35', lineHeight: 24, textAlign: 'center', fontStyle: 'italic' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  // Section title
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#A0522D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingHorizontal: 20 },

  // Day rows
  dayRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 8, borderRadius: 14,
    padding: 14, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#EDE0D4',
    shadowColor: '#8B6347', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  dayRowActive: {
    backgroundColor: '#FDF3E7',
    borderColor: '#A0522D',
    borderWidth: 1.5,
  },
  dayRowPast: { opacity: 0.5 },
  dayNumberBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F5EDE3', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  dayNumberBoxActive: { backgroundColor: '#A0522D' },
  dayNumber: { fontSize: 13, fontWeight: '700', color: '#8B6347' },
  dayNumberActive: { color: '#FFF8F0' },
  dayInfo: { flex: 1 },
  dayTheme: { fontSize: 14, fontWeight: '600', color: '#3D2B1F', marginBottom: 2 },
  dayThemeActive: { color: '#6B3A2A' },
  dayVerse: { fontSize: 12, color: '#8B6347', opacity: 0.8 },
  dayPrompt: { fontSize: 13, color: '#5C4033', fontStyle: 'italic', marginTop: 8, lineHeight: 20 },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A0522D', marginLeft: 8 },
});