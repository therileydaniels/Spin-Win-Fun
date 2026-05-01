import { PRESET_COLORS } from "./wheelSegments";

export interface ColorPalette {
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Default",
    colors: PRESET_COLORS,
  },
  {
    name: "Sunset",
    colors: ["#FF6B35", "#F7931E", "#FFD23F", "#EE4266", "#C62368", "#540D6E"],
  },
  {
    name: "Ocean",
    colors: ["#0077B6", "#00B4D8", "#48CAE4", "#90E0EF", "#023E8A", "#0096C7"],
  },
  {
    name: "Neon",
    colors: ["#FF00FF", "#00FF41", "#FFFF00", "#FF073A", "#00F0FF", "#B026FF"],
  },
  {
    name: "Pastel",
    colors: ["#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#E8BAFF", "#FFD9BA"],
  },
  {
    name: "Forest",
    colors: ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#1B4332", "#95D5B2"],
  },
  {
    name: "Berry",
    colors: ["#7B2D8E", "#9B2335", "#D4145A", "#E91E63", "#AD1457", "#6A1B9A"],
  },
  {
    name: "Fire",
    colors: ["#FF0000", "#FF4500", "#FF6600", "#FF8C00", "#FFD700", "#FF1744"],
  },
  {
    name: "Candy",
    colors: ["#FF69B4", "#FF1493", "#FF6EC7", "#DA70D6", "#BA55D3", "#FFB6C1"],
  },
  {
    name: "Monochrome",
    colors: ["#1A1A2E", "#16213E", "#0F3460", "#533483", "#E94560", "#393E46"],
  },
  {
    name: "Holo",
    colors: ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#ff6ad2", "#97e1d4", "#f9c784", "#b5ead7"],
  },
  {
    name: "Mono Pink",
    colors: ["#880e4f", "#ad1457", "#c2185b", "#d81b60", "#e91e8c", "#f06292", "#f48fb1", "#fce4ec"],
  },
  {
    name: "Mono Purple",
    colors: ["#4a148c", "#6a1b9a", "#7b1fa2", "#8e24aa", "#9c27b0", "#ab47bc", "#ce93d8", "#f3e5f5"],
  },
  {
    name: "Mono Red",
    colors: ["#4e0000", "#7f0000", "#a30000", "#c62828", "#e53935", "#ef5350", "#ef9a9a", "#ffcdd2"],
  },
  {
    name: "Mono Teal",
    colors: ["#004d40", "#00695c", "#00796b", "#00897b", "#009688", "#26a69a", "#80cbc4", "#e0f2f1"],
  },
  {
    name: "Mono Blue",
    colors: ["#0d47a1", "#1565c0", "#1976d2", "#1e88e5", "#2196f3", "#42a5f5", "#90caf9", "#e3f2fd"],
  },
  {
    name: "Mono Gold",
    colors: ["#4a3000", "#7a5000", "#a87000", "#c8902a", "#e8b04a", "#f0c060", "#f8d880", "#fff0a0"],
  },
];
