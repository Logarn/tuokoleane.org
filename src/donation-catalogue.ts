export type DonationCatalogueKind = "fixed" | "custom" | "time";

export interface DonationCatalogueItem {
  id: string;
  title: string;
  kind: DonationCatalogueKind;
  price?: number;
  minimumAmount?: number;
}

export const donationCatalogue = [
  { id: "donate-any-amount", title: "Donate any amount", kind: "custom", minimumAmount: 500 },
  { id: "grocery-basket", title: "Buy a grocery basket", kind: "fixed", price: 2500 },
  { id: "school-shoes", title: "Buy a pair of school shoes", kind: "fixed", price: 2000 },
  { id: "clothing-set", title: "Buy a clothing set", kind: "fixed", price: 2500 },
  { id: "textbooks", title: "Buy textbooks", kind: "fixed", price: 1500 },
  { id: "school-trip", title: "Help a learner join a school trip", kind: "custom", minimumAmount: 500 },
  { id: "medical-bill", title: "Help with a medical bill", kind: "custom", minimumAmount: 500 },
  { id: "period-care", title: "Buy a period care pack", kind: "fixed", price: 1200 },
  { id: "baby-care", title: "Buy a baby care pack", kind: "fixed", price: 1800 },
  { id: "warm-blanket", title: "Buy a warm blanket", kind: "fixed", price: 1500 },
  { id: "school-backpack", title: "Buy a school backpack", kind: "fixed", price: 2200 },
  { id: "school-uniform", title: "Buy a school uniform", kind: "custom", minimumAmount: 500 },
  { id: "back-to-school-bundle", title: "Buy a back-to-school bundle", kind: "fixed", price: 5000 },
  { id: "meal", title: "Buy a meal", kind: "fixed", price: 500 },
  { id: "school-supplies", title: "Buy school supplies", kind: "fixed", price: 1200 },
  { id: "tree", title: "Plant a tree", kind: "fixed", price: 800 },
  { id: "school-fees", title: "Support school fees", kind: "custom", minimumAmount: 500 },
  { id: "mentor", title: "Mentor a student", kind: "time" },
  { id: "cook-family", title: "Cook for a family", kind: "time" },
  { id: "listen", title: "Listen to someone", kind: "time" },
  { id: "clothes", title: "Donate clothes", kind: "time" },
  { id: "sharesphere-session", title: "Support a ShareSphere session", kind: "fixed", price: 1500 },
  { id: "elder-visit", title: "Visit an older neighbour", kind: "time" },
  { id: "wellness-day", title: "Support a wellness day", kind: "fixed", price: 2300 },
  { id: "food-shelf", title: "Stock a Family Unit food shelf", kind: "fixed", price: 1800 },
] as const satisfies readonly DonationCatalogueItem[];

export const donationCatalogueById = new Map<string, DonationCatalogueItem>(
  donationCatalogue.map((item) => [item.id, item]),
);
