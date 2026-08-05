import { Href, Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppPalette } from "@/constants/theme";

type HomeHeaderProps = {
  greetingLabel: string;
  greeting: string;
  profileSummary: string;
  avatarInitials: string;
  palette: AppPalette;
  isDark: boolean;
  hasNotifications?: boolean;
};

export function HomeHeader({
  greetingLabel,
  greeting,
  profileSummary,
  avatarInitials,
  palette,
  isDark,
  hasNotifications = true,
}: HomeHeaderProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          <View style={styles.avatarOuter}>
            <View
              style={[
                styles.avatarRing,
                {
                  backgroundColor: isDark
                    ? "rgba(59,130,246,0.35)"
                    : "rgba(37,99,235,0.18)",
                },
              ]}
            />
            <View
              style={[styles.avatar, { backgroundColor: palette.primarySoft }]}
            >
              <Text style={[styles.avatarText, { color: palette.primary }]}>
                {avatarInitials || greeting[0]?.toUpperCase() || "G"}
              </Text>
            </View>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.kicker, { color: palette.muted }]}>
              {greetingLabel}
            </Text>
            <Text
              style={[styles.headerName, { color: palette.text }]}
              numberOfLines={1}
            >
              {greeting}
            </Text>
            <View style={styles.summaryRow}>
              <View
                style={[
                  styles.summaryDot,
                  { backgroundColor: palette.success },
                ]}
              />
              <Text
                style={[styles.headerMeta, { color: palette.muted }]}
                numberOfLines={1}
              >
                {profileSummary}
              </Text>
            </View>
          </View>
        </View>
        <Link href={"/(tabs)/profile" as Href} asChild>
          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              {
                backgroundColor: palette.soft,
                borderColor: palette.border,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <SymbolView
              name={
                {
                  ios: "bell.fill",
                  android: "notifications",
                  web: "notifications",
                } as any
              }
              size={19}
              tintColor={palette.text}
              weight="semibold"
            />
            {hasNotifications ? (
              <View
                style={[styles.notifBadge, { backgroundColor: palette.danger }]}
              />
            ) : null}
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 13, flex: 1 },
  avatarOuter: { width: 52, height: 52, position: "relative" },
  avatarRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 999,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarText: { fontSize: 17, fontWeight: "900", letterSpacing: -0.2 },
  headerTextBlock: { flex: 1, gap: 3 },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  headerName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryDot: { width: 6, height: 6, borderRadius: 3 },
  headerMeta: { fontSize: 13, fontWeight: "600" },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});
