import type { LucideIcon } from "lucide-react";
import {
  Apple,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  MessageCircleHeart,
  PackageOpen,
  Salad,
  Sprout,
} from "lucide-react";

export type PackageKind = "fixed" | "custom" | "time";

export interface KindnessPackage {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  program: string;
  kind: PackageKind;
  price?: number;
  duration: string;
  label: string;
  accent: string;
  icon: LucideIcon;
  includes: string[];
}

export const categories = ["All", "Food", "Education", "Environment", "Time & care", "Essentials"];

export const kindnessPackages: KindnessPackage[] = [
  {
    id: "meal",
    title: "Buy a meal",
    shortDescription: "Put one warm meal on someone’s table.",
    description:
      "Contribute toward a meal shared through Tuokoleane Initiative’s community and family activities.",
    category: "Food",
    program: "TI Family Experience",
    kind: "fixed",
    price: 100,
    duration: "About 5 min",
    label: "Most direct",
    accent: "coral",
    icon: Apple,
    includes: ["One meal contribution", "Allocated by the local TI team", "Fulfilment update when available"],
  },
  {
    id: "school-supplies",
    title: "Sponsor school supplies",
    shortDescription: "Help a learner start class ready.",
    description:
      "Contribute toward practical learning supplies for a student supported through TI education activities.",
    category: "Education",
    program: "TI All-Round Champ",
    kind: "fixed",
    price: 100,
    duration: "About 10 min",
    label: "Education",
    accent: "ochre",
    icon: BookOpen,
    includes: ["School-supply contribution", "Grouped with other contributions", "Programme update when available"],
  },
  {
    id: "tree",
    title: "Plant a tree",
    shortDescription: "Fund a small act with a longer life.",
    description:
      "Contribute toward a tree-planting activity organised with a Tuokoleane community or Family Unit.",
    category: "Environment",
    program: "Random Acts of Kindness",
    kind: "fixed",
    price: 100,
    duration: "About 30 min",
    label: "For the future",
    accent: "leaf",
    icon: Sprout,
    includes: ["Tree contribution", "Locally coordinated planting", "Activity update when available"],
  },
  {
    id: "school-fees",
    title: "Support school fees",
    shortDescription: "Choose what you can put toward a child’s education.",
    description:
      "Make an open contribution toward scholarships and education support under TI All-Round Champ.",
    category: "Education",
    program: "TI All-Round Champ",
    kind: "custom",
    duration: "Choose an amount",
    label: "Open contribution",
    accent: "blue",
    icon: GraduationCap,
    includes: ["You choose the amount", "Placed in the education-support pool", "Allocation update when available"],
  },
  {
    id: "mentor",
    title: "Mentor a student",
    shortDescription: "Give an hour, a skill and your attention.",
    description:
      "Register your interest in supporting confidence, leadership or practical learning through mentorship.",
    category: "Time & care",
    program: "TI All-Round Champ",
    kind: "time",
    duration: "1 hour",
    label: "Give your time",
    accent: "plum",
    icon: HeartHandshake,
    includes: ["One-hour interest registration", "Skills and availability matching", "TI team follow-up before placement"],
  },
  {
    id: "cook-family",
    title: "Cook for a family",
    shortDescription: "Make a meal together, not just a delivery.",
    description:
      "Register to help prepare and share food during an organised TI Family Experience activity.",
    category: "Food",
    program: "TI Family Experience",
    kind: "time",
    duration: "Volunteer",
    label: "Show up",
    accent: "coral",
    icon: Salad,
    includes: ["Volunteer interest registration", "Activity matching", "Safety and logistics confirmation before the visit"],
  },
  {
    id: "listen",
    title: "Listen to someone",
    shortDescription: "Sometimes the useful thing is being present.",
    description:
      "Register to support welcoming, human conversations through a facilitated TI ShareSphere session.",
    category: "Time & care",
    program: "TI ShareSphere",
    kind: "time",
    duration: "Session based",
    label: "Be present",
    accent: "blue",
    icon: MessageCircleHeart,
    includes: ["Interest registration", "Session orientation", "Facilitated participation rather than clinical care"],
  },
  {
    id: "clothes",
    title: "Donate clothes",
    shortDescription: "Pass useful clothing to someone who needs it.",
    description:
      "Register a clothing donation and let the local TI team confirm what is needed and where to deliver it.",
    category: "Essentials",
    program: "TI Family Experience",
    kind: "time",
    duration: "Drop-off",
    label: "Give goods",
    accent: "ochre",
    icon: PackageOpen,
    includes: ["Donation interest registration", "Needs confirmation", "Drop-off details from the TI team"],
  },
];

export const programs = [
  {
    number: "01",
    name: "TI ShareSphere",
    summary: "Safe spaces for conversation, creative expression and peer connection.",
    tone: "blue",
  },
  {
    number: "02",
    name: "TI All-Round Champ",
    summary: "Education, mentorship, scholarships and practical skills beyond the classroom.",
    tone: "ochre",
  },
  {
    number: "03",
    name: "TI Family Experience",
    summary: "Shared meals, visits and ordinary moments of belonging with vulnerable families.",
    tone: "coral",
  },
  {
    number: "04",
    name: "TI Culinary Hub",
    summary: "Different cultures around one table, learning through food and story.",
    tone: "plum",
  },
  {
    number: "05",
    name: "TI FamilyFit",
    summary: "Social, practical wellness through movement, nutrition and preventive care.",
    tone: "leaf",
  },
  {
    number: "06",
    name: "TI Family Units",
    summary: "Local communities built around sharing resources and looking after one another.",
    tone: "blue",
  },
];
