import { PRESET_COLORS } from "./wheelSegments";

export interface ColorPalette {
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  { name: "Default",        colors: PRESET_COLORS },

  // WARM & BOLD
  { name: "Hot Fire",       colors: ["#e63946","#f4722b","#f9a825","#e91e8c","#c2185b","#ff6f00","#ff4081","#d32f2f"] },
  { name: "Lava",           colors: ["#ff0000","#ff3d00","#ff6d00","#ff9100","#ffab00","#dd2c00","#bf360c","#e65100"] },
  { name: "Sunset Blvd",    colors: ["#ff6b6b","#ff8e53","#feb47b","#ff6b9d","#c44569","#f8b500","#ff4757","#ff7f50"] },
  { name: "Tropical",       colors: ["#ff4e50","#fc913a","#f9d62e","#e84393","#ff6b81","#ff9f43","#ee5a24","#fd79a8"] },
  { name: "Inferno",        colors: ["#9b0000","#cc0000","#e60000","#ff1a00","#ff4500","#ff6600","#ff8800","#ffaa00"] },
  { name: "Ember",          colors: ["#b5451b","#d45d27","#e8773a","#f0934e","#e85d04","#dc2f02","#9d0208","#6a040f"] },
  { name: "Chili",          colors: ["#8b0000","#a50000","#c00000","#d62828","#f77f00","#fcbf49","#e63946","#c1121f"] },
  { name: "Desert Spice",   colors: ["#c1440e","#d4651a","#e68a3a","#c87941","#a0522d","#8b3a1a","#d2691e","#e07b4f"] },

  // PURPLE & PINK
  { name: "Berry Crush",    colors: ["#6a0dad","#8e24aa","#ab47bc","#ce93d8","#880e4f","#c2185b","#e91e8c","#f48fb1"] },
  { name: "Ultraviolet",    colors: ["#3d0066","#5c0099","#7b00cc","#9900ff","#b84dff","#cc80ff","#7c4dff","#651fff"] },
  { name: "Bubblegum",      colors: ["#ff84b7","#ff5ba3","#ff3d8e","#ff1a7a","#f50057","#ff4081","#f48fb1","#fce4ec"] },
  { name: "Velvet Rose",    colors: ["#4a0030","#7b0051","#ad0073","#de0094","#e040fb","#ea80fc","#ce93d8","#880e4f"] },
  { name: "Orchid",         colors: ["#9c27b0","#7b1fa2","#6a1b9a","#4a148c","#aa00ff","#d500f9","#e040fb","#ce93d8"] },
  { name: "Fuchsia",        colors: ["#ff00ff","#e040fb","#ea80fc","#f50057","#ff4081","#ff80ab","#c51162","#ad1457"] },
  { name: "Cotton Candy",   colors: ["#ffb3de","#ff80c0","#ff4dac","#ff1a97","#e91e8c","#f8bbd0","#fce4ec","#f48fb1"] },
  { name: "Dark Plum",      colors: ["#2d0037","#4a0060","#6b0080","#8b00a0","#a000b8","#6a0572","#4a0040","#380030"] },
  { name: "Wisteria",       colors: ["#7b5ea7","#9b7cc7","#b99dd4","#d4bee4","#8e6abf","#6a4c9c","#5c3d8f","#4a2d80"] },

  // SOFT & PASTEL
  { name: "Pastel Dream",   colors: ["#f8bbd0","#e1bee7","#c5cae9","#b2ebf2","#c8e6c9","#fff9c4","#ffe0b2","#fce4ec"] },
  { name: "Cotton Soft",    colors: ["#ffd6e7","#ffb3c6","#ffc8dd","#bde0fe","#a2d2ff","#cdb4db","#ffc8a2","#d4f1f4"] },
  { name: "Fairy Floss",    colors: ["#ffb5e8","#ff9cee","#ffbcbc","#ff828b","#ffc8a2","#d5aaff","#b5ead7","#e7c6ff"] },
  { name: "Kawaii",         colors: ["#ffb7c5","#ffccd5","#ffd6e0","#ffafc5","#ff85a1","#ff6b9d","#ffc2d4","#ffe5ec"] },
  { name: "Sorbet",         colors: ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff"] },
  { name: "Dreamsicle",     colors: ["#ffcba4","#ffb385","#ffa07a","#ff8c69","#ff7043","#ffccbc","#ffe0b2","#fff3e0"] },
  { name: "Sakura",         colors: ["#ffb7c5","#ff8fa3","#ff6b81","#ff4757","#ffc2d4","#ffd6e7","#ffe4e1","#ffb3c6"] },
  { name: "Mint Chip",      colors: ["#b2f7ef","#8ee3d8","#6bd4c4","#a8e6cf","#dcedc8","#f0f4c3","#e8f5e9","#c8e6c9"] },

  // NEON & ELECTRIC
  { name: "Neon Dark",      colors: ["#ff0080","#7700ff","#00f5ff","#ff6600","#ccff00","#ff00cc","#0066ff","#ff3300"] },
  { name: "Cyberpunk",      colors: ["#ff003c","#ff6600","#ffcc00","#00ff9f","#00b4d8","#7b2fff","#ff00ff","#ff4081"] },
  { name: "Acid",           colors: ["#e8ff00","#aaff00","#00ff41","#00ffcc","#00e5ff","#ff6600","#ff0080","#cc00ff"] },
  { name: "Rave",           colors: ["#ff00de","#6600ff","#0033ff","#00ccff","#00ff99","#ccff00","#ff6600","#ff0044"] },
  { name: "Electric",       colors: ["#0ff0fc","#f000ff","#ff0080","#7fff00","#ff6600","#0080ff","#ff0000","#8000ff"] },
  { name: "Vaporwave Neon", colors: ["#ff71ce","#01cdfe","#05ffa1","#b967ff","#fffb96","#ff3864","#2de2e6","#f6019d"] },
  { name: "Laser Grid",     colors: ["#ff0055","#ff6600","#ffcc00","#00ff00","#00ccff","#0000ff","#cc00ff","#ff00cc"] },
  { name: "UV Light",       colors: ["#bf00ff","#9d00ff","#7b00ff","#5900ff","#3700ff","#1500ff","#ff00e4","#ff00aa"] },

  // DARK & MOODY
  { name: "Midnight Gold",  colors: ["#1a1a2e","#16213e","#0f3460","#533483","#7b2d8b","#c9a227","#e8c547","#d4a017"] },
  { name: "Dark Vampire",   colors: ["#0d0000","#1a0000","#2d0000","#4a0000","#6b0000","#8b0000","#a80000","#c40000"] },
  { name: "Gothic",         colors: ["#1a0030","#2d0050","#0d0d0d","#4a0040","#6b0060","#1a1a3a","#2d1b4e","#3d0066"] },
  { name: "Witchcraft",     colors: ["#13000d","#250020","#3d0035","#57004d","#730066","#1a0030","#0d1a0d","#1a1a00"] },
  { name: "Dark Academia",  colors: ["#2c1810","#4a2c17","#6b4423","#8b5e3c","#a67c52","#2d2416","#1a1a0d","#3d3020"] },
  { name: "Noir",           colors: ["#0d0d0d","#1a1a1a","#262626","#333333","#8b0000","#6b0000","#4a0000","#cc0000"] },
  { name: "Deep Space",     colors: ["#000011","#000033","#000055","#000077","#1a0030","#30004a","#4a0060","#0d0022"] },
  { name: "Obsidian",       colors: ["#0d0d0d","#1a0a0a","#0a0a1a","#0a1a0a","#1a1a0a","#0d0033","#330d0d","#0d330d"] },

  // OCEAN & COOL
  { name: "Ocean Deep",     colors: ["#03045e","#023e8a","#0077b6","#0096c7","#00b4d8","#48cae4","#90e0ef","#ade8f4"] },
  { name: "Mermaid",        colors: ["#006d77","#83c5be","#edf6f9","#ffddd2","#e29578","#00b4d8","#48cae4","#4cc9f0"] },
  { name: "Arctic",         colors: ["#caf0f8","#90e0ef","#48cae4","#00b4d8","#0096c7","#0077b6","#023e8a","#03045e"] },
  { name: "Tidal Wave",     colors: ["#2196f3","#1976d2","#1565c0","#0d47a1","#00bcd4","#00acc1","#00838f","#006064"] },
  { name: "Ice Queen",      colors: ["#e0f7fa","#b2ebf2","#80deea","#4dd0e1","#26c6da","#00bcd4","#b3e5fc","#e1f5fe"] },
  { name: "Caribbean",      colors: ["#00b4d8","#0096c7","#0077b6","#48cae4","#90e0ef","#06d6a0","#1b9aaa","#07beb8"] },

  // NATURE & EARTH
  { name: "Dark Floral",    colors: ["#2d1b33","#4a1942","#6d2b5e","#8b3a7e","#a0206e","#c9485b","#e07b54","#3b2f4a"] },
  { name: "Enchanted",      colors: ["#1b4332","#2d6a4f","#40916c","#52b788","#74c69d","#081c15","#1a3a2a","#0a2615"] },
  { name: "Autumn",         colors: ["#582f0e","#7f4f24","#936639","#a68a64","#b6ad90","#c2a878","#dda15e","#bc6c25"] },
  { name: "Terracotta",     colors: ["#9b2226","#ae2012","#bb3e03","#ca6702","#ee9b00","#94d2bd","#0a9396","#005f73"] },
  { name: "Moss",           colors: ["#386641","#6a994e","#a7c957","#f2e8cf","#bc4749","#4f772d","#90a955","#31572c"] },
  { name: "Desert Sand",    colors: ["#d4a373","#ccd5ae","#e9edc9","#fefae0","#faedcd","#c9b99a","#a98467","#8b6f47"] },
  { name: "Night Bloom",    colors: ["#10002b","#240046","#3c096c","#5a189a","#7b2d8b","#9d4edd","#c77dff","#e0aaff"] },
  { name: "Jewel Tones",    colors: ["#1b4332","#1d3557","#6d2b5e","#9b2226","#ae5000","#6b4226","#1a535c","#4a1942"] },

  // AESTHETIC & VIBE
  { name: "Vaporwave",      colors: ["#ff71ce","#01cdfe","#05ffa1","#b967ff","#fffb96","#ff6ad2","#c774e8","#ad8cff"] },
  { name: "Y2K",            colors: ["#ff00ff","#00ffff","#ff9900","#33ff00","#ff0066","#9900ff","#0099ff","#ffff00"] },
  { name: "Lofi Chill",     colors: ["#5c4033","#8d6e63","#a1887f","#bcaaa4","#d7ccc8","#7986cb","#9fa8da","#c5cae9"] },
  { name: "Cottagecore",    colors: ["#8fbc8f","#deb887","#d2b48c","#f5deb3","#ffe4b5","#ffdab9","#e6ccb2","#b8860b"] },
  { name: "Dark Cottage",   colors: ["#3b4a2e","#5c6b3a","#7a8450","#4a3728","#6b4f38","#8b6b4a","#2d3320","#1e2818"] },
  { name: "E-Girl",         colors: ["#ff003c","#ff0080","#cc00ff","#6600ff","#ff6600","#ff0000","#ff4444","#cc0033"] },
  { name: "Witch Core",     colors: ["#1a0030","#2d0050","#4a0070","#6b0090","#8b00b0","#800000","#400000","#200000"] },
  { name: "Angel Core",     colors: ["#fff5f5","#ffe0e0","#ffc0cb","#ffb6c1","#ffa0b0","#f8e0ff","#e8d0ff","#d8c0f0"] },
  { name: "Ethereal",       colors: ["#e8d5f5","#d4a8f0","#c084f5","#a855f7","#9333ea","#f0d9ff","#e9c6ff","#fdf0ff"] },
  { name: "Dark Romantic",  colors: ["#2d0a14","#4a1020","#6b1530","#8b1a3a","#a01f45","#bf2350","#d42d5c","#5a0020"] },

  // METALLIC & LUXURY
  { name: "Rose Gold",      colors: ["#b76e79","#c9858e","#d4a5a5","#e8b4b8","#f2c4ce","#c97b84","#a85c68","#e8c5b0"] },
  { name: "Champagne",      colors: ["#f7e7ce","#f0d49a","#e8c06c","#daa838","#c8922a","#b87c1c","#a0660e","#8b5200"] },
  { name: "Black Gold",     colors: ["#0d0d0d","#1a1a1a","#333300","#4d4d00","#666600","#c9a227","#e8c547","#f0d060"] },
  { name: "Chrome",         colors: ["#c0c0c0","#a8a8a8","#909090","#787878","#606060","#d8d8d8","#e8e8e8","#f0f0f0"] },
  { name: "Bronze Age",     colors: ["#cd7f32","#a0522d","#8b4513","#d2691e","#c68642","#b8860b","#daa520","#f0a000"] },
  { name: "Obsidian Pearl", colors: ["#1a1a1a","#2d2d2d","#4a3f4a","#6b5b6b","#8b7a8b","#a89aaa","#c5b8c5","#e2d8e2"] },

  // POP & FUN
  { name: "Candy Pop",      colors: ["#ff6eb4","#ff9a3c","#ffe156","#56e39f","#59c3c3","#a78bfa","#f472b6","#fb7185"] },
  { name: "Rainbow",        colors: ["#ff0000","#ff7700","#ffff00","#00ff00","#0000ff","#8b00ff","#ff0080","#00ffff"] },
  { name: "Retro Arcade",   colors: ["#ff0000","#ff6600","#ffff00","#00ff00","#00ccff","#0000ff","#cc00ff","#ff00cc"] },
  { name: "80s Synth",      colors: ["#ff6ec7","#ff2079","#cc00ff","#4d00ff","#0057ff","#00c8ff","#00ffb4","#ccff00"] },
  { name: "Miami Vice",     colors: ["#ff6b9d","#c44569","#f8b500","#ff6348","#ff4757","#eccc68","#1e90ff","#00d2d3"] },
  { name: "Skittles",       colors: ["#ff0000","#ff8800","#ffff00","#00cc00","#aa00ff","#ff0080","#ff6600","#00aaff"] },
  { name: "Gummy Bear",     colors: ["#ff6b6b","#ff9a3c","#ffe156","#56e39f","#4ecdc4","#a78bfa","#ff6b6b","#feca57"] },
  { name: "Holographic",    colors: ["#ff71ce","#01cdfe","#05ffa1","#b967ff","#ff6ad2","#97e1d4","#f9c784","#b5ead7"] },

  // MONOCHROMATIC
  { name: "Mono Pink",      colors: ["#880e4f","#ad1457","#c2185b","#d81b60","#e91e8c","#f06292","#f48fb1","#fce4ec"] },
  { name: "Mono Purple",    colors: ["#4a148c","#6a1b9a","#7b1fa2","#8e24aa","#9c27b0","#ab47bc","#ce93d8","#f3e5f5"] },
  { name: "Mono Red",       colors: ["#4e0000","#7f0000","#a30000","#c62828","#e53935","#ef5350","#ef9a9a","#ffcdd2"] },
  { name: "Mono Teal",      colors: ["#004d40","#00695c","#00796b","#00897b","#009688","#26a69a","#80cbc4","#e0f2f1"] },
  { name: "Mono Blue",      colors: ["#0d47a1","#1565c0","#1976d2","#1e88e5","#2196f3","#42a5f5","#90caf9","#e3f2fd"] },
  { name: "Mono Gold",      colors: ["#4a3000","#7a5000","#a87000","#c8902a","#e8b04a","#f0c060","#f8d880","#fff0a0"] },
];
