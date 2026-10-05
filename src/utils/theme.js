export const colors = [
  "#EF4444", // Coral Red
  "#2563EB", // Royal Blue
  "#0891B2", // Cyan
  "#0EA5E9", // Sky Blue
  "#4F46E5", // Indigo
  "#1E3A8A", // Deep Blue

  "#0369A1", // Ocean Blue
  "#65A30D", // Lime
  "#16A34A", // Green
  "#059669", // Emerald
  "#0F766E", // Teal

  "#475569", // Slate
  "#7C3AED", // Violet
  "#A855F7", // Purple
  "#C026D3", // Fuchsia
  "#DB2777", // Pink
  "#E11D48", // Rose

  "#B91C1C", // Dark Red
  "#CA8A04", // Gold
  "#EA580C", // Orange
  "#92400E", // Brown
  "#334155", // Dark Slate

  "#64748B", // Gray
  "#1E293B", // Charcoal
  "#0F172A", // Midnight
  "#000000", // Black
];
// export const colors = [
//   "#C75B6A", // Dusty Rose
//   "#5B6FA6", // Soft Royal Blue
//   "#4F8A9A", // Muted Cyan
//   "#5F8F82", // Sage Teal
//   "#5B946B", // Forest Green
//   "#B08A4A", // Antique Gold
//   "#B87552", // Terracotta
//   "#7B669E", // Muted Violet
//   "#A65F7A", // Dusty Plum
//   "#59636E", // Graphite
// ];
export const theme = {
  mode: "light",
  colors: {
    primary: "#EB5757",
    black: "#000000",
    white: "#ffffff",
    gray: "#6b6b6b",

    // Semantic aliases
    bg: "#f3f4f6", // light gray background
    cardBg: "#ffffff", // white card background
    badgeBg: "#f8fafc", // light badge background
    text: "#1f2937", // dark text
    textTitle: "#1e293b", // dark title
    textMuted: "#64748b", // muted text
    textValue: "#334155", // value text
    border: "#e5e7eb", // border
    borderDashed: "#e2e8f0", // dashed border
    headerBg: "#ffffff", // header background
    sidebarBg: "#EB5757", // sidebar background (starts as primary)
  },
};

export const darkTheme = {
  mode: "dark",
  colors: {
    primary: "#8B5CF6",
    black: "#050508",
    white: "#ffffff",
    gray: "#9ca3af",

    // Semantic aliases picked directly from the dark theme reference image
    bg: "#08070B", // Deep obsidian black background
    cardBg: "#121118", // Deep dark card surface
    badgeBg: "#1E1D2A", // Dark pill/badge background
    text: "#f8fafc", // Light text
    textTitle: "#ffffff", // Pure white title
    textMuted: "#94a3b8", // Muted subtext
    textValue: "#cbd5e1", // Value text
    border: "#1F1E2B", // Subtle dark border
    borderDashed: "#2A293A", // Dashed border
    headerBg: "#08070B", // Header background
    sidebarBg: "#08070B", // Sidebar background
  },
};

export const lightTheme = theme;
export default theme;
