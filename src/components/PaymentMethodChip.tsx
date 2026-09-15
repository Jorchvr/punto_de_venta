import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../stores/theme.store";
import type { MetodoPago } from "../db/ventas.repo";

export const METODOS: { key: MetodoPago; label: string; emoji: string }[] = [
  { key: "Efectivo", label: "PESOS MXN", emoji: "💵" },
  { key: "Transferencia", label: "TRANSFER.", emoji: "🔁" },
  { key: "Tarjeta", label: "TARJETA", emoji: "💳" },
  { key: "Dolares", label: "DÓLARES", emoji: "💵" },
];

interface Props {
  method: (typeof METODOS)[number];
  selected: boolean;
  onPress: () => void;
}

export function PaymentMethodChip({ method, selected, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, minWidth: 130, margin: 4 }}>
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: selected ? colors.accent : colors.card,
          borderWidth: 1.5,
          borderColor: colors.borderStrong,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 12,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 18 }}>{method.emoji}</Text>
        <Text
          style={{
            color: selected ? colors.white : colors.text,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 13,
            letterSpacing: 0.5,
          }}
        >
          {method.label}
        </Text>
      </Pressable>
    </View>
  );
}
