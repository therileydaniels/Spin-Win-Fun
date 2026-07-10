export interface WheelTemplate {
  id: string;
  name: string;
  description: string;
  category: "games" | "decisions" | "giveaways" | "fun";
  segments: Array<{
    id: string;
    label: string;
    color: string;
    weight: number;
  }>;
}

export const TEMPLATE_CATEGORIES = ["games", "decisions", "giveaways", "fun"] as const;

export const WHEEL_TEMPLATES: WheelTemplate[] = [
  {
    id: "tip-game-rewards",
    name: "Tip Game Rewards",
    description: "Reward tippers with fun prizes and interactions",
    category: "games",
    segments: [
      { id: "tg1", label: "Small Tease", color: "#A855F7", weight: 0 },
      { id: "tg2", label: "Dance", color: "#6366F1", weight: 0 },
      { id: "tg3", label: "Song Request", color: "#0EA5E9", weight: 0 },
      { id: "tg4", label: "Shoutout", color: "#14B8A6", weight: 0 },
      { id: "tg5", label: "Mystery Prize", color: "#EC4899", weight: 0 },
      { id: "tg6", label: "Big Reward", color: "#F472B6", weight: 0 },
    ],
  },
  {
    id: "truth-or-dare",
    name: "Truth or Dare",
    description: "Classic party game with a wild card twist",
    category: "fun",
    segments: [
      { id: "td1", label: "Truth", color: "#7C3AED", weight: 0 },
      { id: "td2", label: "Dare", color: "#EC4899", weight: 0 },
      { id: "td3", label: "Truth", color: "#8B5CF6", weight: 0 },
      { id: "td4", label: "Dare", color: "#DB2777", weight: 0 },
      { id: "td5", label: "Wild Card", color: "#0EA5E9", weight: 0 },
      { id: "td6", label: "Skip", color: "#0D9488", weight: 0 },
    ],
  },
  {
    id: "giveaway-picker",
    name: "Giveaway Picker",
    description: "Run giveaways with suspenseful near-miss moments",
    category: "giveaways",
    segments: [
      { id: "gp1", label: "Winner!", color: "#A855F7", weight: 10 },
      { id: "gp2", label: "Try Again", color: "#6366F1", weight: 20 },
      { id: "gp3", label: "So Close", color: "#0EA5E9", weight: 20 },
      { id: "gp4", label: "Winner!", color: "#8B5CF6", weight: 10 },
      { id: "gp5", label: "Better Luck", color: "#14B8A6", weight: 20 },
      { id: "gp6", label: "Almost!", color: "#EC4899", weight: 20 },
    ],
  },
  {
    id: "yes-no-maybe",
    name: "Yes No Maybe",
    description: "Let the wheel decide when you can't make up your mind",
    category: "decisions",
    segments: [
      { id: "yn1", label: "Yes", color: "#14B8A6", weight: 0 },
      { id: "yn2", label: "No", color: "#EC4899", weight: 0 },
      { id: "yn3", label: "Maybe", color: "#A855F7", weight: 0 },
      { id: "yn4", label: "Ask Again", color: "#0EA5E9", weight: 0 },
    ],
  },
  {
    id: "prize-wheel",
    name: "Prize Wheel",
    description: "Classic prize wheel with tiered rewards and a rare jackpot",
    category: "games",
    segments: [
      { id: "pw1", label: "$5", color: "#0EA5E9", weight: 25 },
      { id: "pw2", label: "$10", color: "#14B8A6", weight: 25 },
      { id: "pw3", label: "$20", color: "#A855F7", weight: 20 },
      { id: "pw4", label: "$50", color: "#7C3AED", weight: 10 },
      { id: "pw5", label: "Free Spin", color: "#EC4899", weight: 15 },
      { id: "pw6", label: "Jackpot", color: "#DB2777", weight: 5 },
    ],
  },
];
