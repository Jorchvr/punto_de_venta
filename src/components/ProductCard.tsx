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

const SHADOW = "#0F0F17";
const OFFSET = 4;

export function ProductCard({ producto, onPress, width = 180 }: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  const outOfStock = producto.EsServicio === 0 && producto.Stock === 0;
  const lowStock = producto.EsServicio === 0 && producto.Stock > 0 && producto.Stock < 5;

  return (
    <View style={{ width, height: 142, margin: 8, position: "relative" }}>
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
          flex: 1,
          backgroundColor: colors.card,
          borderColor: SHADOW,
          borderWidth: 2.5,
          borderRadius: 10,
          padding: 12,
          justifyContent: "space-between",
          transform: [
            { translateX: pressed ? OFFSET : 0 },
            { translateY: pressed ? OFFSET : 0 },
          ],
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Fraunces_700Bold",
            fontSize: 13,
            color: colors.text,
            letterSpacing: 0.5,
          }}
        >
          {producto.Nombre.toUpperCase()}
        </Text>
        <View>
          <Text
            style={{
              fontFamily: "Fraunces_700Bold",
              fontSize: 22,
              color: colors.green,
              letterSpacing: 0.3,
            }}
          >
            {money(producto.Precio)}
          </Text>
          {producto.EsServicio === 1 ? (
            <Text
              style={{
                fontFamily: "Fraunces_700Bold",
                fontSize: 11,
                color: colors.textMuted,
                letterSpacing: 0.6,
              }}
            >
              SERVICIO
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: "Fraunces_700Bold",
                fontSize: 11,
                color: outOfStock || lowStock ? colors.danger : colors.textMuted,
                letterSpacing: 0.6,
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
