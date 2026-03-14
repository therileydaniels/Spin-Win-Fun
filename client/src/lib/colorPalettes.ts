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
];
