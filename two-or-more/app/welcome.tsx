import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.screen}>

      {/* Center — Logo */}
      <View style={styles.center}>
        <Text style={styles.appName}>rooted</Text>
        <Text style={styles.tagline}>A devotional for two</Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.verse}>"Two are better than one."</Text>
        <Text style={styles.verseRef}>Ecclesiastes 4:9</Text>
      </View>

      {/* Bottom — Buttons */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => router.push({ pathname: '/login', params: { mode: 'signup' } })}
        >
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push({ pathname: '/login', params: { mode: 'signin' } })}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF6F0',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 52,
  },

  // Center
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 130, height: 130, marginBottom: 16 },
  appName: { fontSize: 52, fontWeight: '800', color: '#6B3A2A', letterSpacing: -2, lineHeight: 54 },
  tagline: { fontSize: 14, color: '#A0522D', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8, opacity: 0.8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 28, width: '60%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },
  verse: { fontSize: 17, color: '#5C4033', fontStyle: 'italic', textAlign: 'center', lineHeight: 26 },
  verseRef: { fontSize: 13, color: '#A0522D', marginTop: 6, opacity: 0.7 },

  // Buttons
  bottom: { gap: 12 },
  signUpButton: {
    backgroundColor: '#A0522D',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  signUpText: { color: '#FFF8F0', fontWeight: '700', fontSize: 17, letterSpacing: 0.3 },
  signInButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C8956C',
  },
  signInText: { color: '#A0522D', fontWeight: '700', fontSize: 17, letterSpacing: 0.3 },
});