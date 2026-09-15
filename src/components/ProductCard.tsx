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
  const outOfStock = producto.EsServicio === 0 && producto.Stock === 0;
  const lowStock = producto.EsServicio === 0 && producto.Stock > 0 && producto.Stock < 5;

  return (
    <View style={{ width, height: 132, margin: 6 }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          flex: 1,
          backgroundColor: pressed ? colors.accentSoft : colors.card,
          borderColor: colors.borderStrong,
          borderWidth: 1.5,
          borderRadius: 12,
          padding: 12,
          justifyContent: "space-between",
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 13,
            color: colors.text,
            letterSpacing: 0.3,
          }}
        >
          {producto.Nombre.toUpperCase()}
        </Text>
        <View>
          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 20,
              color: colors.green,
            }}
          >
            {money(producto.Precio)}
          </Text>
          {producto.EsServicio === 1 ? (
            <Text
              style={{
                fontFamily: "SpaceGrotesk_600SemiBold",
                fontSize: 11,
                color: colors.textMuted,
                letterSpacing: 0.5,
              }}
            >
              SERVICIO
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 11,
                color: outOfStock || lowStock ? colors.danger : colors.textMuted,
                letterSpacing: 0.5,
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
