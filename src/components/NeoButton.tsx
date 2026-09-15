import React, { useState } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../stores/theme.store";
import type { ThemePalette } from "../theme/colors";

type Variant = "primary" | "yellow" | "green" | "pink" | "blue" | "surface" | "black";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const SHADOW = "#0F0F17";

function variantBg(v: Variant, colors: ThemePalette): string {
  switch (v) {
    case "primary":
    case "green":
    case "pink":
      return colors.accent;
    case "black":
    case "yellow":
      return colors.text;
    case "blue":
    case "surface":
    default:
      return colors.white;
  }
}

function variantFg(v: Variant, colors: ThemePalette): string {
  switch (v) {
    case "primary":
    case "green":
    case "pink":
    case "black":
    case "yellow":
      return colors.white;
    default:
      return colors.text;
  }
}

export function NeoButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  full,
  disabled,
  style,
}: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  const pad = size === "sm" ? 9 : size === "lg" ? 16 : 12;
  const font = size === "sm" ? 12 : size === "lg" ? 17 : 14;
  const radius = size === "sm" ? 8 : 10;
  const offset = size === "sm" ? 3 : size === "lg" ? 5 : 4;

  const bg = variantBg(variant, colors);
  const fg = variantFg(variant, colors);

  return (
    <View
      style={[
        {
          width: full ? "100%" : undefined,
          opacity: disabled ? 0.5 : 1,
          position: "relative",
        },
        style,
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: offset,
          left: offset,
          right: 0,
          bottom: 0,
          backgroundColor: SHADOW,
          borderRadius: radius,
        }}
      />
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          backgroundColor: bg,
          borderColor: SHADOW,
          borderWidth: 2.5,
          borderRadius: radius,
          paddingVertical: pad,
          paddingHorizontal: pad + 6,
          alignItems: "center",
          justifyContent: "center",
          transform: [
            { translateX: pressed ? offset : 0 },
            { translateY: pressed ? offset : 0 },
          ],
        }}
      >
        <Text
          style={{
            color: fg,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: font,
            letterSpacing: 0.8,
            textAlign: "center",
          }}
        >
          {label.toUpperCase()}
        </Text>
      </Pressable>
    </View>
  );
}
