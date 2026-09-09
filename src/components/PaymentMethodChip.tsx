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
  const bg = selected ? colors.yellow : colors.card;
  const fg = selected ? "#0D0D14" : colors.text;

  return (
    <View style={{ flex: 1, minWidth: 130, margin: 4 }}>
      {selected && (
        <View
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            right: -0,
            bottom: -0,
            backgroundColor: "#000",
            borderRadius: 10,
          }}
        />
      )}
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: bg,
          borderColor: "#000",
          borderWidth: 2,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 10,
          alignItems: "center",
          transform: selected ? [{ translateX: 0 }, { translateY: 0 }] : undefined,
        }}
      >
        <Text style={{ fontSize: 20 }}>{method.emoji}</Text>
        <Text
          style={{
            color: fg,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 11,
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {method.label}
        </Text>
      </Pressable>
    </View>
  );
}
