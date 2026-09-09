import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../stores/theme.store";
import { useSession } from "../stores/session.store";

export function Header({
  title,
  showBackoffice,
  onBack,
}: {
  title: string;
  showBackoffice?: boolean;
  onBack?: () => void;
}) {
  const { colors, toggle, name } = useTheme();
  const { usuario } = useSession();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        )}
        <Text
          style={{
            color: colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 20,
            letterSpacing: 1,
          }}
        >
          {title.toUpperCase()}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {usuario && (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontFamily: "SpaceGrotesk_500Medium",
                fontSize: 11,
              }}
            >
              {usuario.toUpperCase()}
            </Text>
          </View>
        )}
        {showBackoffice && (
          <Pressable
            onPress={() => router.push("/backoffice")}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: colors.accent,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: "#000",
            }}
          >
            <Text
              style={{
                color: "#000",
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 11,
              }}
            >
              BACKOFFICE
            </Text>
          </Pressable>
        )}
        <Pressable onPress={toggle} hitSlop={10} style={{ padding: 6 }}>
          <Ionicons
            name={name === "dark" ? "sunny-outline" : "moon-outline"}
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}
