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
  const bg = selected ? colors.accent : colors.surface2;
  const fg = selected ? colors.white : colors.text;

  return (
    <View style={{ flex: 1, minWidth: 130, margin: 4 }}>
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: bg,
          borderWidth: selected ? 0 : 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 22 }}>{method.emoji}</Text>
        <Text
          style={{
            color: fg,
            fontFamily: "SpaceGrotesk_600SemiBold",
            fontSize: 12,
            marginTop: 4,
            letterSpacing: 0.3,
          }}
        >
          {method.label}
        </Text>
      </Pressable>
    </View>
  );
}
