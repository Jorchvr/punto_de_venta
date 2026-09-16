import { Alert, Platform } from "react-native";

export function confirmar(
  titulo: string,
  mensaje: string,
  onConfirmar: () => void,
  opts?: { textoConfirmar?: string; destructivo?: boolean }
): void {
  const textoConfirmar = opts?.textoConfirmar ?? "Confirmar";
  if (Platform.OS === "web") {
    const ok = typeof window !== "undefined" && window.confirm(`${titulo}\n\n${mensaje}`);
    if (ok) onConfirmar();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: "Cancelar", style: "cancel" },
    {
      text: textoConfirmar,
      style: opts?.destructivo ? "destructive" : "default",
      onPress: onConfirmar,
    },
  ]);
}

export function avisar(titulo: string, mensaje?: string): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    return;
  }
  Alert.alert(titulo, mensaje);
}
