export type SizeChart = {
  id: "jackets" | "shirts" | "trousers";
  label: string;
  note: string;
  columns: string[];
  rows: string[][];
};

// Body measurements in inches, with centimetres in brackets.
export const SIZE_CHARTS: SizeChart[] = [
  {
    id: "jackets",
    label: "Suits and blazers",
    note: "Measure around the fullest part of your chest, under the arms. Jackets are cut to sit close to the body; size up if you prefer more room.",
    columns: ["Size", "Chest", "Waist", "Shoulder", "Sleeve"],
    rows: [
      ["36", '36" (91 cm)', '30" (76 cm)', '17" (43 cm)', '24.5" (62 cm)'],
      ["38", '38" (97 cm)', '32" (81 cm)', '17.5" (44 cm)', '25" (63.5 cm)'],
      ["40", '40" (102 cm)', '34" (86 cm)', '18" (46 cm)', '25.5" (65 cm)'],
      ["42", '42" (107 cm)', '36" (91 cm)', '18.5" (47 cm)', '26" (66 cm)'],
      ["44", '44" (112 cm)', '38" (97 cm)', '19" (48 cm)', '26.5" (67 cm)'],
      ["46", '46" (117 cm)', '40" (102 cm)', '19.5" (49.5 cm)', '27" (68.5 cm)'],
    ],
  },
  {
    id: "shirts",
    label: "Shirts",
    note: "Measure around the fullest part of your chest and the base of your neck. Slim fit shirts are cut close through the body.",
    columns: ["Size", "Chest", "Neck", "Shoulder", "Sleeve"],
    rows: [
      ["S", '38" (97 cm)', '15" (38 cm)', '17" (43 cm)', '24" (61 cm)'],
      ["M", '40" (102 cm)', '15.5" (39 cm)', '17.75" (45 cm)', '25" (63.5 cm)'],
      ["L", '42" (107 cm)', '16" (41 cm)', '18.5" (47 cm)', '25.5" (65 cm)'],
      ["XL", '44" (112 cm)', '16.5" (42 cm)', '19.25" (49 cm)', '26" (66 cm)'],
      ["XXL", '46" (117 cm)', '17" (43 cm)', '20" (51 cm)', '26.5" (67 cm)'],
    ],
  },
  {
    id: "trousers",
    label: "Trousers",
    note: "Measure around your natural waistline and the fullest part of your hips. Inseam is the inside leg length before hemming.",
    columns: ["Size", "Waist", "Hip", "Inseam"],
    rows: [
      ["30", '30" (76 cm)', '37" (94 cm)', '32" (81 cm)'],
      ["32", '32" (81 cm)', '39" (99 cm)', '32" (81 cm)'],
      ["34", '34" (86 cm)', '41" (104 cm)', '33" (84 cm)'],
      ["36", '36" (91 cm)', '43" (109 cm)', '33" (84 cm)'],
      ["38", '38" (97 cm)', '45" (114 cm)', '34" (86 cm)'],
    ],
  },
];

export function defaultSizeChartId(categorySlug: string): SizeChart["id"] {
  if (categorySlug === "shirts") return "shirts";
  if (categorySlug === "trousers") return "trousers";
  return "jackets";
}
