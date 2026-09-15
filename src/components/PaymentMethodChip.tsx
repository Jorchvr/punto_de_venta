import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../stores/theme.store";
import type { MetodoPago } from "../db/ventas.repo";

export const METODOS: { key: MetodoPago; label: string; emoji: string }[] = [
  { key: "Efectivo", label: "PESOS MXN", emoji: "💵" },
  { key: "Transferencia", label: "TRANSFER.", emoji: "🔁" },
  { key: "Tarjeta", label: "TARJETA", emoji: "💳" },
  { key: "Dolares", label: "DÓLARES", emoji: "💵" },
];

const SHADOW = "#0F0F17";
const OFFSET = 4;

interface Props {
  method: (typeof METODOS)[number];
  selected: boolean;
  onPress: () => void;
}

export function PaymentMethodChip({ method, selected, onPress }: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <View style={{ flex: 1, minWidth: 130, margin: 4, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          top: OFFSET,
          left: OFFSET,
          right: 0,
          bottom: 0,
          backgroundColor: SHADOW,
          borderRadius: 10,
        }}
      />
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          backgroundColor: selected ? colors.accent : colors.card,
          borderWidth: 2.5,
          borderColor: SHADOW,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 10,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          transform: [
            { translateX: pressed ? OFFSET : 0 },
            { translateY: pressed ? OFFSET : 0 },
          ],
        }}
      >
        <Text style={{ fontSize: 18 }}>{method.emoji}</Text>
        <Text
          style={{
            color: selected ? colors.white : colors.text,
            fontFamily: "Fraunces_700Bold",
            fontSize: 12,
            letterSpacing: 0.6,
          }}
        >
          {method.label}
        </Text>
      </Pressable>
    </View>
  );
}
