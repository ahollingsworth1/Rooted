import { auth } from '@/lib/firebase';
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  usePushNotifications()
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Give Firebase up to 5 seconds to resolve auth state
    timeoutRef.current = setTimeout(() => {
      setReady(true);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setUser(firebaseUser);
      setReady(true);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Show nothing until auth is fully resolved
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#FAF6F0' }} />;
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="pathway/[id]" options={{ headerShown: false }} />
    </Stack>
    
  );
}