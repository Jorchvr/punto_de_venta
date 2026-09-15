import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export async function printHtml(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
  }
}
