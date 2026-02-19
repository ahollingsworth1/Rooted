import { auth } from '@/lib/firebase';
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fallback — if auth doesn't resolve in 3 seconds, assume logged out
    timeoutRef.current = setTimeout(() => {
      setUser(prev => prev === undefined ? null : prev);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setUser(firebaseUser);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF6F0' }}>
        <ActivityIndicator color="#A0522D" size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
    </Stack>
  );
}