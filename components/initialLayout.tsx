import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function initialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)";
    const inTabsScreen = segments[0] === "(tabs)";
    const currentPath = segments.join("/");

    if (!isSignedIn && !inAuthScreen) {
      // Only redirect if we're not already on the login page
      if (currentPath !== "(auth)/login") {
        router.replace("/(auth)/login");
      }
    } else if (isSignedIn && inAuthScreen) {
      // Only redirect if we're not already on the tabs page
      if (!inTabsScreen) {
        router.replace("/(tabs)");
      }
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
