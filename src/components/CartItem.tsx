import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CartItem as CartItemType } from "../stores/cart.store";
import { useTheme } from "../stores/theme.store";
import { money } from "../utils/money";

interface Props {
  item: CartItemType;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}

export function CartItemRow({ item, onInc, onDec, onRemove }: Props) {
  const { colors } = useTheme();
  const sub = item.precio * item.cantidad;

  return (
    <View
      style={{
        backgroundColor: colors.surface2,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontFamily: "Fraunces_700Bold",
            fontSize: 13,
          }}
        >
          {item.nombre.toUpperCase()}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: "Fraunces_500Medium",
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {money(item.precio)} C/U
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Pressable
          onPress={onDec}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.borderStrong,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="remove" size={18} color={colors.text} />
        </Pressable>
        <View
          style={{
            minWidth: 32,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: colors.accent,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontFamily: "Fraunces_700Bold",
              fontSize: 14,
            }}
          >
            {item.cantidad}
          </Text>
        </View>
        <Pressable
          onPress={onInc}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.borderStrong,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
      <View style={{ minWidth: 78, alignItems: "flex-end", marginLeft: 8 }}>
        <Text
          style={{
            color: colors.green,
            fontFamily: "Fraunces_700Bold",
            fontSize: 14,
          }}
        >
          {money(sub)}
        </Text>
      </View>
      <Pressable onPress={onRemove} style={{ padding: 6, marginLeft: 4 }} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color={colors.pink} />
      </Pressable>
    </View>
  );
}
