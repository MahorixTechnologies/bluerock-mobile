import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";

import { useColorScheme } from "@/components/useColorScheme";
import { getPalette } from "@/constants/theme";
import { AuthProvider } from "@/providers/AuthProvider";
import { BookingProvider } from "@/providers/BookingProvider";
import { AppQueryProvider } from "@/providers/QueryProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        <BottomSheetModalProvider>
          <AppQueryProvider>
            <AuthProvider>
              <SettingsProvider>
                <BookingProvider>
                  <RootLayoutNav />
                </BookingProvider>
              </SettingsProvider>
            </AuthProvider>
          </AppQueryProvider>
        </BottomSheetModalProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = getPalette(isDark);
  const LightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: palette.bg,
      card: palette.card,
      border: palette.border,
      text: palette.text,
      primary: palette.primary,
      notification: palette.primary,
    },
  };
  const NightTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: palette.bg,
      card: palette.card,
      border: palette.border,
      text: palette.text,
      primary: palette.primary,
      notification: palette.primary,
    },
  };

  return (
    <ThemeProvider value={isDark ? NightTheme : LightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "transparentModal", animation: "fade" }} />
      </Stack>
    </ThemeProvider>
  );
}
