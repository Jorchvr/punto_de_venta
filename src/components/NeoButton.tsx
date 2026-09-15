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

type Kind = "solid-accent" | "solid-dark" | "outline-dark" | "outline-accent";

function resolveVariant(v: Variant): Kind {
  switch (v) {
    case "primary":
    case "green":
      return "solid-accent";
    case "yellow":
    case "black":
      return "solid-dark";
    case "pink":
      return "outline-accent";
    default:
      return "outline-dark";
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
  const kind = resolveVariant(variant);

  const pad = size === "sm" ? 10 : size === "lg" ? 16 : 13;
  const font = size === "sm" ? 13 : size === "lg" ? 17 : 15;
  const radius = size === "sm" ? 10 : 12;

  const styles = (() => {
    switch (kind) {
      case "solid-accent":
        return { bg: colors.accent, fg: colors.white, border: colors.borderStrong };
      case "solid-dark":
        return { bg: colors.text, fg: colors.white, border: colors.borderStrong };
      case "outline-accent":
        return { bg: colors.card, fg: colors.accent, border: colors.accent };
      case "outline-dark":
      default:
        return { bg: colors.card, fg: colors.text, border: colors.borderStrong };
    }
  })();

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
          backgroundColor: styles.bg,
          borderColor: styles.border,
          borderWidth: 1.5,
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
            color: styles.fg,
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: font,
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          {label.toUpperCase()}
        </Text>
      </Pressable>
    </View>
  );
}
