import { Platform } from "react-native";
import { Contribution } from "../types";

type ContributionWithUser = Contribution & {
  user?: { name?: string; email?: string };
};

export function generateCSV(
  contributions: ContributionWithUser[],
  groupName: string,
): string {
  const header = "Date,Member,Email,Amount,Note\n";
  const rows = contributions
    .map((c) => {
      const date = new Date(c.created_at).toISOString().split("T")[0];
      const name = (c.user?.name ?? "Unknown").replace(/,/g, " ");
      const email = c.user?.email ?? "";
      const note = (c.note ?? "").replace(/,/g, " ").replace(/\n/g, " ");
      return `${date},${name},${email},${c.amount},"${note}"`;
    })
    .join("\n");

  return header + rows;
}

export async function shareCSV(csv: string, filename: string): Promise<void> {
  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Native: dynamically import to avoid TS errors when package isn't installed
  try {
    const FileSystem = require("expo-file-system");
    const Sharing = require("expo-sharing");
    if (!FileSystem.cacheDirectory) return;
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path, {
      mimeType: "text/csv",
      UTI: "public.comma-separated-values-text",
    });
  } catch {
    // expo-file-system not available — fallback silently
  }
}
