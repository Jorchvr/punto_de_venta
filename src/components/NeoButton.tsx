import React, { useState } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../stores/theme.store";

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

type Kind = "solid" | "outline" | "ghost";

function resolveVariant(v: Variant): { kind: Kind; tone: "accent" | "neutral" } {
  switch (v) {
    case "primary":
    case "green":
      return { kind: "solid", tone: "accent" };
    case "pink":
      return { kind: "outline", tone: "accent" };
    case "yellow":
    case "black":
      return { kind: "solid", tone: "neutral" };
    case "blue":
    case "surface":
    default:
      return { kind: "outline", tone: "neutral" };
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
  const { kind, tone } = resolveVariant(variant);

  const pad = size === "sm" ? 10 : size === "lg" ? 16 : 13;
  const font = size === "sm" ? 13 : size === "lg" ? 17 : 15;
  const radius = size === "sm" ? 10 : 14;

  const solidBg = tone === "accent" ? colors.accent : colors.text;
  const solidFg = colors.white;

  const outlineBorder = tone === "accent" ? colors.accent : colors.borderStrong;
  const outlineFg = tone === "accent" ? colors.accent : colors.text;

  const bg =
    kind === "solid"
      ? solidBg
      : kind === "ghost"
        ? "transparent"
        : colors.white;

  const fg = kind === "solid" ? solidFg : outlineFg;
  const borderColor = kind === "outline" ? outlineBorder : "transparent";
  const borderWidth = kind === "outline" ? 1.5 : 0;

  return (
    <View
      style={[
        {
          width: full ? "100%" : undefined,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          backgroundColor: bg,
          borderColor,
          borderWidth,
          borderRadius: radius,
          paddingVertical: pad,
          paddingHorizontal: pad + 6,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.98 : 1 }],
        }}
      >
        <Text
          style={{
            color: fg,
            fontFamily: "SpaceGrotesk_600SemiBold",
            fontSize: font,
            letterSpacing: 0.2,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
