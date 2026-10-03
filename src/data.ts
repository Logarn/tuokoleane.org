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

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface KindnessPackage {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  program: string;
  kind: PackageKind;
  price?: number;
  minimumAmount?: number;
  duration: string;
  label: string;
  icon: LucideIcon;
  includes: string[];
  images: GalleryImage[];
  suitableFor: string;
  coordination: string;
  goodToKnow: string[];
}

export const categories = ["All", "Food", "Education", "Environment", "Time & care", "Essentials"];

const gallery = (id: string, descriptions: string[]): GalleryImage[] =>
  descriptions.map((description, index) => ({
    src: `/images/listings/${id}/0${index + 1}.jpg`,
    alt: `Representative scene: ${description}`,
  }));

export const kindnessPackages: KindnessPackage[] = [
  {
    id: "meal",
    title: "Buy a meal",
    shortDescription: "Put one warm meal on someone’s table.",
    description:
      "Contribute toward a meal shared through a Tuokoleane community or family activity. The local team decides where the contribution is useful before anything is promised to a recipient.",
    category: "Food",
    program: "TI Family Experience",
    kind: "fixed",
    price: 500,
    duration: "About 5 min",
    label: "Most direct",
    icon: Apple,
    includes: ["One meal contribution", "Local coordination by the TI team", "A fulfilment update when one is available"],
    images: gallery("meal", [
      "a family and volunteers preparing a meal together",
      "fresh food being served at a shared table",
      "people sharing an ordinary community meal",
      "hands preparing vegetables in a bright kitchen",
    ]),
    suitableFor: "Anyone who wants to start with one small, practical contribution.",
    coordination: "Tuokoleane groups meal contributions around a real family or community activity.",
    goodToKnow: ["This is a contribution, not a meal-delivery order.", "Recipients are not identified publicly.", "Timing depends on an organised TI activity."],
  },
  {
    id: "school-supplies",
    title: "Sponsor school supplies",
    shortDescription: "Help a learner start class ready.",
    description:
      "Contribute toward practical learning materials for a student supported through a Tuokoleane education activity. Contributions may be grouped so the team can buy what is actually needed.",
    category: "Education",
    program: "TI All-Round Champ",
    kind: "fixed",
    price: 1200,
    duration: "About 10 min",
    label: "Education",
    icon: BookOpen,
    includes: ["School-supply contribution", "Needs checked before purchasing", "A programme update when one is available"],
    images: gallery("school-supplies", [
      "learners using new notebooks with a teacher nearby",
      "practical school materials arranged for a class",
      "a learner and guardian looking through study supplies",
      "a bright classroom activity with shared learning materials",
    ]),
    suitableFor: "Donors who prefer a clear education-related starting point.",
    coordination: "The TI team checks the current learning need before supplies are purchased or distributed.",
    goodToKnow: ["The contribution may be pooled with others.", "Specific brands or items are not guaranteed.", "Children’s identities remain private."],
  },
  {
    id: "tree",
    title: "Plant a tree",
    shortDescription: "Fund a small act with a longer life.",
    description:
      "Contribute toward a tree-planting activity organised with a Tuokoleane community or Family Unit. The work includes choosing a suitable planting moment and someone to care for the young tree.",
    category: "Environment",
    program: "Random Acts of Kindness",
    kind: "fixed",
    price: 800,
    duration: "About 30 min",
    label: "For the future",
    icon: Sprout,
    includes: ["Tree contribution", "Locally coordinated planting", "An activity update when one is available"],
    images: gallery("tree", [
      "community members planting a young tree together",
      "hands setting a seedling into prepared soil",
      "a family watering a newly planted tree",
      "neighbours caring for young trees in a shared green space",
    ]),
    suitableFor: "People who want to support a visible, practical environmental activity.",
    coordination: "Tuokoleane matches contributions to a locally organised planting opportunity.",
    goodToKnow: ["The exact species and site depend on local conditions.", "Planting is scheduled, not immediate.", "A contribution is not a survival guarantee for a tree."],
  },
  {
    id: "school-fees",
    title: "Support school fees",
    shortDescription: "Choose what you can put toward a child’s education.",
    description:
      "Make an open contribution toward scholarships and education support under TI All-Round Champ. The contribution goes into the education-support pool rather than directly to an unnamed child.",
    category: "Education",
    program: "TI All-Round Champ",
    kind: "custom",
    minimumAmount: 500,
    duration: "Choose an amount",
    label: "Open contribution",
    icon: GraduationCap,
    includes: ["You choose the amount", "Contribution to the education-support pool", "An allocation update when one is available"],
    images: gallery("school-fees", [
      "a learner participating confidently in class",
      "a teacher supporting a learner during a lesson",
      "a guardian and learner reviewing schoolwork together",
      "students collaborating around a classroom table",
    ]),
    suitableFor: "Donors who want to choose their own education contribution.",
    coordination: "The TI team assesses education requests and decides how pooled support can be allocated.",
    goodToKnow: ["No individual child is promised on this prototype.", "Allocation criteria still need to be published.", "This demo does not collect money or issue receipts."],
  },
  {
    id: "mentor",
    title: "Mentor a student",
    shortDescription: "Give an hour, a skill and your attention.",
    description:
      "Register your interest in supporting confidence, leadership or practical learning through mentorship. Tuokoleane must confirm safeguarding, fit and availability before a placement is made.",
    category: "Time & care",
    program: "TI All-Round Champ",
    kind: "time",
    duration: "1 hour",
    label: "Give your time",
    icon: HeartHandshake,
    includes: ["One-hour interest registration", "Skills and availability matching", "TI follow-up before any placement"],
    images: gallery("mentor", [
      "a mentor and learner working through a practical project",
      "a small supervised mentoring session in a learning space",
      "a mentor listening as a learner explains an idea",
      "a collaborative study activity with a facilitator present",
    ]),
    suitableFor: "Adults willing to share a practical skill and follow TI’s safeguarding process.",
    coordination: "Tuokoleane reviews volunteer interest before matching anyone to a supervised activity.",
    goodToKnow: ["Registering interest is not a confirmed placement.", "Screening and orientation may be required.", "Contact with children must follow safeguarding rules."],
  },
  {
    id: "cook-family",
    title: "Cook for a family",
    shortDescription: "Make a meal together, not just a delivery.",
    description:
      "Register to help prepare and share food during an organised TI Family Experience. The intention is participation and belonging, with families involved rather than treated as passive recipients.",
    category: "Food",
    program: "TI Family Experience",
    kind: "time",
    duration: "Volunteer",
    label: "Show up",
    icon: Salad,
    includes: ["Volunteer interest registration", "Activity and availability matching", "Safety and logistics confirmation before the visit"],
    images: gallery("cook-family", [
      "a family and volunteers cooking side by side",
      "people preparing vegetables around a kitchen table",
      "a shared meal being plated together",
      "adults and children sharing a warm family meal",
    ]),
    suitableFor: "People who enjoy cooking, listening and taking part without taking over.",
    coordination: "The TI team confirms the activity, food plan and practical boundaries before anyone visits.",
    goodToKnow: ["A volunteer request is not an automatic invitation to a home.", "Dietary and safety requirements come first.", "Families choose how they participate."],
  },
  {
    id: "listen",
    title: "Listen to someone",
    shortDescription: "Sometimes the useful thing is being present.",
    description:
      "Register to support welcoming, human conversations through a facilitated TI ShareSphere session. This is community participation and peer connection, not counselling or clinical care.",
    category: "Time & care",
    program: "TI ShareSphere",
    kind: "time",
    duration: "Session based",
    label: "Be present",
    icon: MessageCircleHeart,
    includes: ["Interest registration", "Session orientation", "Facilitated, non-clinical participation"],
    images: gallery("listen", [
      "a facilitated small group in attentive conversation",
      "two community members listening to each other warmly",
      "a welcoming peer discussion in a bright shared room",
      "a facilitator creating space for a group conversation",
    ]),
    suitableFor: "Patient listeners who can respect privacy, boundaries and a facilitated format.",
    coordination: "Tuokoleane confirms the session, orientation and participation boundaries in advance.",
    goodToKnow: ["This is not therapy or crisis support.", "Private stories must stay private.", "Participation depends on facilitator approval."],
  },
  {
    id: "clothes",
    title: "Donate clothes",
    shortDescription: "Pass useful clothing to someone who needs it.",
    description:
      "Register a clothing donation and let the local TI team confirm what is useful and where to deliver it. This helps avoid sending items that do not match a current need.",
    category: "Essentials",
    program: "TI Family Experience",
    kind: "time",
    duration: "Drop-off",
    label: "Give goods",
    icon: PackageOpen,
    includes: ["Donation interest registration", "A check of what is currently needed", "Drop-off details from the TI team"],
    images: gallery("clothes", [
      "community volunteers sorting clean clothing carefully",
      "folded useful clothes prepared for respectful distribution",
      "a parent choosing suitable clothing with a volunteer",
      "neighbours organising donated clothing in a bright community room",
    ]),
    suitableFor: "Anyone with clean, useful clothing who is willing to check the need first.",
    coordination: "The TI team confirms accepted items, condition and a suitable drop-off point.",
    goodToKnow: ["Do not drop items off before confirmation.", "Only clean, wearable clothing should be offered.", "Recipients should be able to choose what suits them."],
  },
];

export const programs = [
  { number: "01", name: "TI ShareSphere", summary: "Safe spaces for conversation, creative expression and peer connection." },
  { number: "02", name: "TI All-Round Champ", summary: "Education, mentorship, scholarships and practical skills beyond the classroom." },
  { number: "03", name: "TI Family Experience", summary: "Shared meals, visits and ordinary moments of belonging with vulnerable families." },
  { number: "04", name: "TI Culinary Hub", summary: "Different cultures around one table, learning through food and story." },
  { number: "05", name: "TI FamilyFit", summary: "Social, practical wellness through movement, nutrition and preventive care." },
  { number: "06", name: "TI Family Units", summary: "Local communities built around sharing resources and looking after one another." },
];
