import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../stores/theme.store";
import { useSession } from "../stores/session.store";

const LOGO = require("../../assets/powergym-logo.png");

export function Header({
  title,
  showBackoffice,
  onBack,
}: {
  title: string;
  showBackoffice?: boolean;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const { usuario } = useSession();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <Image
            source={LOGO}
            style={{ width: 40, height: 40, borderRadius: 10 }}
            resizeMode="cover"
          />
        )}
        <Text
          style={{
            color: colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 20,
            letterSpacing: 0.2,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {usuario && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: colors.surface2,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontFamily: "SpaceGrotesk_600SemiBold",
                fontSize: 12,
              }}
            >
              {usuario}
            </Text>
          </View>
        )}
        {showBackoffice && (
          <Pressable
            onPress={() => router.push("/backoffice")}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: colors.accent,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: colors.white,
                fontFamily: "SpaceGrotesk_600SemiBold",
                fontSize: 12,
                letterSpacing: 0.3,
              }}
            >
              Backoffice
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
