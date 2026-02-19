import { StyleSheet, Text, View } from 'react-native';

interface RootedHeaderProps {
  subtitle?: string;
}

export default function RootedHeader({ subtitle }: RootedHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>

        <View style={styles.textBlock}>
          <Text style={styles.title}>rooted</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerDot}>✦</Text>
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FAF6F0',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 82,
    height: 82,
    marginRight: 12,
  },
  textBlock: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#6B3A2A',
    letterSpacing: -1,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 12,
    color: '#A0522D',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '500',
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4B896',
  },
  dividerDot: {
    color: '#C8956C',
    fontSize: 10,
    marginHorizontal: 8,
  },
});