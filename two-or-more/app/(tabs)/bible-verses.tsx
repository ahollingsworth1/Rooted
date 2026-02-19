import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import BibleVerseInput from '@/components/BibleVerseInput';

export default function BibleVersesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <BibleVerseInput />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 