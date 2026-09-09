import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Producto } from "../db/productos.repo";
import { useTheme } from "../stores/theme.store";
import { money } from "../utils/money";

interface Props {
  producto: Producto;
  onPress: () => void;
  width?: number;
}

export function ProductCard({ producto, onPress, width = 180 }: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  const lowStock = producto.EsServicio === 0 && producto.Stock < 5;
  const bg = pressed ? colors.yellow : colors.card;
  const fg = pressed ? "#0D0D14" : colors.text;

  return (
    <View style={{ width, height: 132, margin: 6 }}>
      <View
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          right: -0,
          bottom: -0,
          backgroundColor: "#000000",
          borderRadius: 10,
        }}
      />
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          flex: 1,
          backgroundColor: bg,
          borderColor: "#000000",
          borderWidth: 2,
          borderRadius: 10,
          padding: 10,
          justifyContent: "space-between",
          transform: pressed ? [{ translateX: 4 }, { translateY: 4 }] : undefined,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 13,
            color: fg,
            letterSpacing: 0.3,
          }}
        >
          {producto.Nombre.toUpperCase()}
        </Text>
        <View>
          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 18,
              color: pressed ? "#0D0D14" : colors.green,
            }}
          >
            {money(producto.Precio)}
          </Text>
          {lowStock ? (
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 11,
                color: colors.pink,
              }}
            >
              STOCK: {producto.Stock}
            </Text>
          ) : producto.EsServicio === 1 ? (
            <Text
              style={{
                fontFamily: "SpaceGrotesk_500Medium",
                fontSize: 10,
                color: pressed ? "#0D0D14" : colors.textMuted,
              }}
            >
              SERVICIO
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: "SpaceGrotesk_500Medium",
                fontSize: 10,
                color: pressed ? "#0D0D14" : colors.textMuted,
              }}
            >
              STOCK: {producto.Stock}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
