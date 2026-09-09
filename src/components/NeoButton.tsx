import React, { useState } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../stores/theme.store";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "yellow" | "green" | "pink" | "blue" | "surface" | "black";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
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
  const { colors, name } = useTheme();
  const [pressed, setPressed] = useState(false);

  const bg = (() => {
    switch (variant) {
      case "yellow":
        return colors.yellow;
      case "green":
        return colors.green;
      case "pink":
        return colors.pink;
      case "blue":
        return colors.blue;
      case "surface":
        return colors.card;
      case "black":
        return "#000000";
      default:
        return colors.card;
    }
  })();

  const fg =
    variant === "black"
      ? "#FFFFFF"
      : variant === "surface"
        ? colors.text
        : "#0D0D14";

  const pad = size === "sm" ? 8 : size === "lg" ? 18 : 12;
  const font = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  const shadowColor = variant === "yellow" ? "#000000" : name === "dark" ? colors.yellow : "#000000";

  const offset = pressed ? 0 : 4;

  return (
    <View
      style={[
        {
          width: full ? "100%" : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: shadowColor,
          borderRadius: 10,
          position: "absolute",
          top: 4,
          left: 4,
          right: -0,
          bottom: -0,
        }}
      />
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          backgroundColor: bg,
          borderColor: "#000000",
          borderWidth: 2,
          borderRadius: 10,
          paddingVertical: pad,
          paddingHorizontal: pad + 4,
          transform: [{ translateX: offset === 0 ? 4 : 0 }, { translateY: offset === 0 ? 4 : 0 }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: fg,
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
