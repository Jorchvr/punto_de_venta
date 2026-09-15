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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
        ) : (
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: colors.text,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={LOGO}
              style={{ width: 42, height: 42 }}
              resizeMode="contain"
            />
          </View>
        )}
        <Text
          style={{
            color: colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 22,
            letterSpacing: 0.5,
          }}
          numberOfLines={1}
        >
          {title.toUpperCase()}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {usuario && (
          <Text
            style={{
              color: colors.textMuted,
              fontFamily: "SpaceGrotesk_600SemiBold",
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            {usuario.toUpperCase()}
          </Text>
        )}
        {showBackoffice && (
          <Pressable
            onPress={() => router.push("/backoffice")}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: colors.card,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: colors.borderStrong,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 12,
                letterSpacing: 0.5,
              }}
            >
              BACKOFFICE
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
