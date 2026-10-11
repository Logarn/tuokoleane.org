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
  Ticket,
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
  featured?: boolean;
  eventDate?: string;
  eventDateShort?: string;
  eventDateIso?: string;
  priceUnit?: string;
  actionLabel?: string;
}

export interface Program {
  id: string;
  number: string;
  name: string;
  kicker: string;
  summary: string;
  overview: string;
  image: string;
  imageAlt: string;
  imageSource: "archive" | "representative";
  accent: string;
  activities: string[];
  intendedOutcomes: string[];
  measurements: string[];
  relatedPackageIds: string[];
}

export const categories = ["All", "Food", "Education", "Mental wellness", "Health", "Environment", "Community", "Time & care", "Essentials"];

const gallery = (id: string, descriptions: string[]): GalleryImage[] =>
  descriptions.map((description, index) => ({
    src: `/images/listings/${id}/0${index + 1}.jpg`,
    alt: `Representative scene: ${description}`,
  }));

export const kindnessPackages: KindnessPackage[] = [
  {
    id: "ti-annual-gala",
    title: "The TI Annual Gala",
    shortDescription: "Join one grand evening of dinner, connection and generous pledges.",
    description:
      "The TI Annual Gala is Tuokoleane Initiative’s once-a-year dinner. Guests share a beautiful evening, hear more about the work and can choose whether to make a voluntary pledge through an auction-style giving experience. The invitation is open to everyone.",
    category: "Community",
    program: "Tuokoleane Initiative",
    kind: "fixed",
    price: 3000,
    duration: "Annual dinner",
    label: "Featured",
    icon: Ticket,
    includes: [
      "One admission to the annual Gala dinner",
      "The full evening programme and auction-style pledge experience",
      "A seat in a room built around connection and giving",
    ],
    images: gallery("ti-annual-gala", [
      "Tuokoleane community members in a representative annual Gala dinner concept",
      "Tuokoleane community members in a representative Gala welcome concept",
      "Tuokoleane community members in a representative voluntary pledge concept",
      "Tuokoleane community members in a representative Gala conversation concept",
    ]),
    suitableFor: "Anyone who would like to join the TI community for its annual signature evening.",
    coordination: "Tuokoleane will confirm the venue, programme and guest details before the event.",
    goodToKnow: [
      "The ticket price is Ksh 3,000 per person.",
      "Auction pledges are voluntary and separate from the ticket.",
      "Guest appearances and venue details are confirmed only when announced by Tuokoleane.",
    ],
    featured: true,
    eventDate: "1 December 2027",
    eventDateShort: "1 Dec 2027",
    eventDateIso: "2027-12-01",
    priceUnit: "per person",
    actionLabel: "Reserve a seat",
  },
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
  {
    id: "sharesphere-session",
    title: "Back a ShareSphere session",
    shortDescription: "Make room for honest conversation and creative expression.",
    description:
      "Contribute toward a facilitated TI ShareSphere gathering where young adults can talk, create and connect with peers. The format is community-based and non-clinical, with professional referrals considered when a participant needs more support.",
    category: "Mental wellness",
    program: "TI ShareSphere",
    kind: "fixed",
    price: 1500,
    duration: "One session",
    label: "Create space",
    icon: MessageCircleHeart,
    includes: ["A contribution toward session materials", "Facilitator and venue coordination", "A programme update when one is available"],
    images: gallery("sharesphere-session", [
      "young adults sharing artwork in a peer circle",
      "a small outdoor peer conversation",
      "a spoken-word and music session with a facilitator",
      "a facilitator preparing a welcoming creative space",
    ]),
    suitableFor: "Anyone who wants to help create a calm, welcoming space for peer connection.",
    coordination: "Tuokoleane confirms the facilitator, setting and session boundaries before the gathering takes place.",
    goodToKnow: ["ShareSphere is not therapy or crisis care.", "Private stories must remain private.", "The contribution may support a shared session rather than one named participant."],
  },
  {
    id: "elder-visit",
    title: "Visit an older neighbour",
    shortDescription: "Offer time, conversation and ordinary companionship.",
    description:
      "Register to take part in a coordinated visit with an older community member. A visit can include conversation, a simple game or a shared household activity, always on terms agreed with the person being visited.",
    category: "Time & care",
    program: "TI Family Experience",
    kind: "time",
    duration: "A few hours",
    label: "Give company",
    icon: HeartHandshake,
    includes: ["Volunteer interest registration", "A locally coordinated and consented visit", "Practical guidance before the activity"],
    images: gallery("elder-visit", [
      "an older woman sharing tea with adult neighbours",
      "an older man teaching a board game to younger neighbours",
      "an older woman sharing family photographs with visitors",
      "older neighbours and younger adults tending herbs together",
    ]),
    suitableFor: "Adults who can listen patiently, respect privacy and follow Tuokoleane’s visit guidance.",
    coordination: "Tuokoleane confirms consent, timing, location and an appropriate activity before any visit is arranged.",
    goodToKnow: ["Registering does not confirm a home visit.", "No person’s address or private details are shared publicly.", "The older person decides how they want to take part."],
  },
  {
    id: "wellness-day",
    title: "Support a wellness day",
    shortDescription: "Help a community move, learn and recharge together.",
    description:
      "Contribute toward a TI FamilyFit activity built around movement, nutrition, hydration and practical preventive wellness. The exact activity is confirmed locally and may include a walk, dance session or community workshop.",
    category: "Health",
    program: "TI FamilyFit",
    kind: "fixed",
    price: 2300,
    duration: "Half-day activity",
    label: "Move together",
    icon: Salad,
    includes: ["Contribution toward activity logistics", "Locally coordinated facilitator or route", "A programme update when one is available"],
    images: gallery("wellness-day", [
      "a mixed-age outdoor community exercise session",
      "adults preparing fruit and water at a nutrition workshop",
      "a community wellness walk on a scenic trail",
      "a joyful dance and aerobics session in a community hall",
    ]),
    suitableFor: "People who want to support social, practical and inclusive wellness activities.",
    coordination: "The TI team confirms the activity, facilitator, venue and safety plan before scheduling the day.",
    goodToKnow: ["This does not purchase medical treatment.", "Activities must suit the people taking part.", "Health checks or blood donation require qualified partners and separate confirmation."],
  },
  {
    id: "food-shelf",
    title: "Stock a Family Unit food shelf",
    shortDescription: "Put useful staples within reach of one local community.",
    description:
      "Contribute toward a shared food shelf managed through a TI Family Unit. Local members confirm what is useful, track the shared stock and agree how it can support neighbours when a need arises.",
    category: "Community",
    program: "TI Family Units",
    kind: "fixed",
    price: 1800,
    duration: "Community pool",
    label: "Share locally",
    icon: PackageOpen,
    includes: ["Contribution toward locally selected staples", "Family Unit coordination and stock tracking", "An allocation update when one is available"],
    images: gallery("food-shelf", [
      "neighbours stocking a shared community food shelf",
      "community members sorting dry food staples",
      "a local team weighing food and checking inventory",
      "neighbours planning the fair use of a shared food shelf",
    ]),
    suitableFor: "Donors who want to strengthen a small, locally managed pool of useful essentials.",
    coordination: "The Family Unit checks current needs, selects the staples and records how the shared stock is used.",
    goodToKnow: ["The contribution is pooled, not assigned to a named household.", "Items depend on local need and availability.", "Production still needs a published allocation and reporting process."],
  },
];

export const programs: Program[] = [
  {
    id: "sharesphere",
    number: "01",
    name: "TI ShareSphere",
    kicker: "Expression, conversation and connection",
    summary: "Safe spaces for conversation, creative expression and peer connection.",
    overview: "ShareSphere is designed as a welcoming place for young people and community members to talk honestly, make something and feel less alone. Sessions can be in person or online and remain clearly non-clinical.",
    image: "/images/listings/sharesphere-session/01.jpg",
    imageAlt: "Representative peer group sharing artwork in a bright community studio",
    imageSource: "representative",
    accent: "#27759a",
    activities: ["Coffee conversations and facilitated peer circles", "Art, music, spoken word and storytelling", "Guest conversations and professional referrals when needed"],
    intendedOutcomes: ["Stronger self-expression", "More confident peer connection", "A clearer route to appropriate support"],
    measurements: ["Sessions held and attendance", "Participant feedback", "Referrals requested or completed"],
    relatedPackageIds: ["sharesphere-session", "listen"],
  },
  {
    id: "all-round-champ",
    number: "02",
    name: "TI All-Round Champ",
    kicker: "Learning beyond the classroom",
    summary: "Education, mentorship, scholarships and practical skills beyond the classroom.",
    overview: "All-Round Champ brings academic support together with confidence, creativity, leadership and practical life skills. The programme is intended to help learners grow as whole people, not only as exam candidates.",
    image: "/images/listings/school-fees/01.jpg",
    imageAlt: "Representative learner taking part confidently in class",
    imageSource: "representative",
    accent: "#d59a25",
    activities: ["Public speaking, essay writing and academic challenges", "Mentorship across sciences, social sciences and the arts", "Scholarship and learning-material support when confirmed"],
    intendedOutcomes: ["Greater academic confidence", "Stronger leadership and communication", "More exposure to practical skills and heritage"],
    measurements: ["Learner participation", "Mentorship hours", "Scholarships and materials allocated"],
    relatedPackageIds: ["school-supplies", "school-fees", "mentor"],
  },
  {
    id: "family-experience",
    number: "03",
    name: "TI Family Experience",
    kicker: "Ordinary moments of belonging",
    summary: "Shared meals, visits and familiar moments with children, families and older neighbours.",
    overview: "Family Experience centres the things that make care feel human: preparing food together, listening, playing, visiting and sharing time without turning anyone into a campaign prop.",
    image: "/images/authentic/2025-04-smiles/04.webp",
    imageAlt: "Tuokoleane volunteers and children dancing together during a family activity",
    imageSource: "archive",
    accent: "#d35f42",
    activities: ["Family-style visits and shared meals", "Storytelling, games, movie nights and self-care activities", "Useful hampers and a larger family festival"],
    intendedOutcomes: ["More ordinary moments of joy", "Stronger relationships and trust", "Practical care shaped with families"],
    measurements: ["Activities coordinated", "Family participation and feedback", "Useful goods matched to confirmed needs"],
    relatedPackageIds: ["meal", "cook-family", "elder-visit", "clothes"],
  },
  {
    id: "culinary-hub",
    number: "04",
    name: "TI Culinary Hub",
    kicker: "Culture shared around one table",
    summary: "Different cultures around one table, learning through food and story.",
    overview: "The Culinary Hub uses food as a practical connector. People can prepare indigenous meals, learn the stories behind them and share ingredients, skills and conversation across generations.",
    image: "/images/authentic/2025-04-family-day/04.webp",
    imageAlt: "A Tuokoleane volunteer preparing food during a community family day",
    imageSource: "archive",
    accent: "#3f8f68",
    activities: ["Indigenous cooking showcases and tastings", "Ingredient and kitchen support", "Food stories, recipes and intergenerational learning"],
    intendedOutcomes: ["Cultural knowledge carried forward", "More shared skills and confidence", "Stronger connection through food"],
    measurements: ["Meals and showcases held", "Recipes or stories documented", "Participants and ingredients supported"],
    relatedPackageIds: ["meal", "cook-family", "food-shelf"],
  },
  {
    id: "familyfit",
    number: "05",
    name: "TI FamilyFit",
    kicker: "Wellness that feels social",
    summary: "Practical wellness through movement, nutrition and preventive care.",
    overview: "FamilyFit makes wellness more approachable by turning it into something people do together. Activities range from movement and hydration to practical education, with qualified partners required for clinical checks or blood donation.",
    image: "/images/listings/wellness-day/01.jpg",
    imageAlt: "Representative mixed-age community exercise session outdoors",
    imageSource: "representative",
    accent: "#2e7f83",
    activities: ["Hikes, yoga, cycling, dance and aerobics", "Nutrition and hydration workshops", "Preventive health activities with qualified partners"],
    intendedOutcomes: ["More consistent movement", "Better practical wellness knowledge", "Stronger social support around healthy habits"],
    measurements: ["Activities and attendance", "Participant feedback", "Qualified partner-led checks when available"],
    relatedPackageIds: ["wellness-day", "tree"],
  },
  {
    id: "sharefest",
    number: "06",
    name: "TI ShareFest",
    kicker: "The family gets together",
    summary: "A nature-based gathering where the programmes, people and cultures meet.",
    overview: "ShareFest is conceived as a three-day Family Get-Together: part celebration, part showcase and part shared retreat. It creates one place for music, games, food, stories and the wider Tuokoleane family.",
    image: "/images/authentic/2025-04-smiles/01.webp",
    imageAlt: "Tuokoleane community members smiling together at a shared event",
    imageSource: "archive",
    accent: "#c17628",
    activities: ["Programme showcases and cultural activities", "Nature walks, games and open-mic moments", "Bonfires and shared meals"],
    intendedOutcomes: ["A stronger sense of one big family", "More visibility across programmes", "Deeper volunteer and community connection"],
    measurements: ["Participants and programme representation", "Volunteer involvement", "Feedback and follow-up actions"],
    relatedPackageIds: ["meal", "listen", "tree", "cook-family"],
  },
  {
    id: "family-units",
    number: "07",
    name: "TI Family Units",
    kicker: "Care organised close to home",
    summary: "Local communities built around sharing resources and looking after one another.",
    overview: "Family Units are small local groups in neighbourhoods, universities and colleges. Each unit can organise shared resources, social activities and practical support around needs its own members understand.",
    image: "/images/listings/food-shelf/01.jpg",
    imageAlt: "Representative neighbours organising a shared community food shelf",
    imageSource: "representative",
    accent: "#3e6794",
    activities: ["Shared food stores and useful resources", "Locally governed trust funds and leadership", "Social, wellness and community-care activities"],
    intendedOutcomes: ["Faster local coordination", "More accountable shared resources", "Stronger everyday mutual support"],
    measurements: ["Active units and members", "Resources contributed and allocated", "Local activities completed"],
    relatedPackageIds: ["food-shelf", "elder-visit", "clothes"],
  },
];
