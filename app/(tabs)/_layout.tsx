import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import type { ColorValue } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/providers/AuthProvider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DURATION = 220;

const BAR_BG = "#ffffff";
const ACTIVE_PILL_BG = "rgba(30,91,255,0.10)";
const ACTIVE_PILL_BORDER = "rgba(30,91,255,0.14)";
const ACTIVE_COLOR = "#1E5BFF";
const INACTIVE_COLOR = "#8a8f9a";
const BAR_BORDER = "rgba(20,20,20,0.06)";

function TabSymbol({
  ios,
  android,
  color,
  focused,
}: {
  ios: string;
  android: string;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <SymbolView
      name={{ ios, android, web: android } as any}
      tintColor={String(color)}
      size={22}
      weight={focused ? "semibold" : "regular"}
    />
  );
}

function TabItem({
  focused,
  label,
  accessibilityLabel,
  onPress,
  onLongPress,
  renderIcon,
}: {
  focused: boolean;
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
  renderIcon: (color: ColorValue) => React.ReactNode;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: DURATION });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      {renderIcon(focused ? ACTIVE_COLOR : INACTIVE_COLOR)}
      <Text
        numberOfLines={1}
        style={[styles.label, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR }]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function isHidden(itemStyle: unknown) {
  const flat = StyleSheet.flatten(itemStyle as any) as
    | { display?: string }
    | undefined;
  return flat?.display === "none";
}

function FloatingTabBar({ state, descriptors, navigation, insets }: any) {
  const routes = state.routes.filter(
    (route: any) => !isHidden(descriptors[route.key].options.tabBarItemStyle),
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.barWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        {routes.map((route: any) => {
          const { options } = descriptors[route.key];
          const focused = state.routes[state.index].key === route.key;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              renderIcon={(color) =>
                options.tabBarIcon?.({ focused, color, size: 22 })
              }
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const isLandlord = profile?.role === "LANDLORD";

  const hideIfLandlord = { display: isLandlord ? ("none" as const) : ("flex" as const) };
  const hideIfNotLandlord = { display: isLandlord ? ("flex" as const) : ("none" as const) };
  const alwaysHidden = { display: "none" as const };

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        sceneStyle: {
          backgroundColor: palette.bg,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isLandlord ? "Dashboard" : "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios={isLandlord ? "square.grid.2x2.fill" : "house.fill"}
              android={isLandlord ? "dashboard" : "home"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="calendar"
              android="event"
              color={color}
              focused={focused}
            />
          ),
          tabBarItemStyle: hideIfLandlord,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="heart.fill"
              android="favorite"
              color={color}
              focused={focused}
            />
          ),
          tabBarItemStyle: hideIfLandlord,
        }}
      />
      <Tabs.Screen
        name="host-listings"
        options={{
          title: "My Listings",
          tabBarLabel: "My Listings",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="building.2.fill"
              android="apartment"
              color={color}
              focused={focused}
            />
          ),
          tabBarItemStyle: hideIfNotLandlord,
        }}
      />
      <Tabs.Screen
        name="host-bookings"
        options={{
          title: "Bookings",
          tabBarLabel: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="person.2.fill"
              android="group"
              color={color}
              focused={focused}
            />
          ),
          tabBarItemStyle: hideIfNotLandlord,
        }}
      />
      <Tabs.Screen
        name="payouts"
        options={{
          title: "Payout",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="wallet.pass"
              android="payments"
              color={color}
              focused={focused}
            />
          ),
          tabBarItemStyle: hideIfNotLandlord,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="magnifyingglass"
              android="search"
              color={color}
              focused={focused}
            />
          ),
          tabBarItemStyle: alwaysHidden,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <TabSymbol
              ios="person"
              android="person"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BAR_BORDER,
    backgroundColor: BAR_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  item: {
    flex: 1,
    minWidth: 48,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 999,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  pill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: ACTIVE_PILL_BG,
    borderWidth: 1,
    borderColor: ACTIVE_PILL_BORDER,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
