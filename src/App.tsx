import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  Heart,
  Images,
  Menu,
  Minus,
  Monitor,
  Moon,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { categories, kindnessPackages, programs, type KindnessPackage, type Program } from "./data";
import {
  TI_PAYMENT_DETAILS,
  donationTotal,
  isValidEmail,
  isValidMpesaReference,
  isValidPhone,
  type DonationNotificationResponse,
  type DonationSubmission,
} from "./donations";
import { BrandLogo } from "./BrandLogo";
import FavoriteButton from "./FavoriteButton";
import MobileCatalogue from "./MobileCatalogue";
import MobilePrograms from "./MobilePrograms";
import { applyRouteSeo } from "./seo";
import { ThemeProvider, useTheme, type ThemePreference } from "./Theme";

interface BasketItem {
  packageId: string;
  quantity: number;
  amount: number;
}

interface Confirmation {
  reference: string;
  email: string;
  itemCount: number;
  total: number;
  causes: string[];
  mpesaReference: string;
}

interface CampaignIdea {
  number: string;
  kicker: string;
  title: string;
  teaser: string;
  description: string[];
  takeaway: string;
  image: string;
  imageAlt: string;
  accent: string;
}

interface GalleryPhoto {
  src: string;
  alt: string;
  collection: "Annual Sharing Day" | "Family Experience" | "TI Moments";
}

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const packageById = new Map(kindnessPackages.map((item) => [item.id, item]));
const programById = new Map(programs.map((program) => [program.id, program]));

function createSubmissionReference() {
  const randomPart = globalThis.crypto?.randomUUID?.().split("-")[0]
    ?? Math.random().toString(36).slice(2, 10);
  return `TI-${randomPart.toUpperCase()}`;
}

const placesReached = [
  { name: "Mount Kenya University", logo: "/images/reach/mku.png" },
  { name: "Pwani University", logo: "/images/reach/pwani.png" },
  { name: "University of Nairobi", logo: "/images/reach/uon.png" },
  { name: "Jomo Kenyatta University of Agriculture and Technology", logo: "/images/reach/jkuat.png" },
  { name: "Kwale County", logo: "/images/reach/kwale.png" },
  { name: "Kisii County", logo: "/images/reach/kisii.png" },
  { name: "Machakos County", logo: "/images/reach/machakos.webp" },
  { name: "Kisumu County", logo: "/images/reach/kisumu.webp" },
  { name: "Kakamega County", logo: "/images/reach/kakamega.png" },
];

const campaignIdeas: CampaignIdea[] = [
  {
    number: "01",
    kicker: "Help today",
    title: "A good heart should not need an event.",
    teaser: "Someone should not have to wait for a fundraiser, a disaster or the right season before help arrives.",
    description: [
      "Most giving is organised around moments: a drive, a gala or a crisis. Human need does not keep that calendar.",
      "Tuokoleane is building a simpler path. Open the catalogue, choose one useful act and see what happens next. If you can help today, there should be a way to begin today.",
    ],
    takeaway: "Charity should not have opening hours.",
    image: "/images/campaign-posters/01-help-today.jpg",
    imageAlt: "Concept artwork of a Kenyan woman opening a gate to offer help to a neighbour",
    accent: "#d92879",
  },
  {
    number: "02",
    kicker: "The Amazon of Charity",
    title: "What if helping felt this simple?",
    teaser: "Find a practical way to help, understand what it means and choose the contribution that fits you.",
    description: [
      "Online shopping made it easy to find almost anything. Helping someone should be just as clear, without reducing a human life to a transaction.",
      "This is about turning good intentions into practical, dignified choices: a meal, school support, time, knowledge or care. You choose the act. Tuokoleane makes the path visible.",
    ],
    takeaway: "Choose one act. Know what it means. Start.",
    image: "/images/campaign-posters/02-amazon-of-charity.jpg",
    imageAlt: "Concept artwork of hands choosing different ways to help around a table",
    accent: "#25368a",
  },
  {
    number: "03",
    kicker: "You already have something",
    title: "The world is waiting for what you can give.",
    teaser: "Your most useful contribution may be time, knowledge, food, money or one honest conversation.",
    description: [
      "You do not need to be wealthy, famous or perfectly prepared to improve someone’s day. You need something useful and the willingness to offer it.",
      "Tuokoleane makes room for different kinds of generosity. Give what you can, in a form that helps, with dignity at the centre.",
    ],
    takeaway: "You do not need everything. Start with something.",
    image: "/images/campaign-posters/03-world-is-waiting.jpg",
    imageAlt: "Concept artwork of a Kenyan community gathered outdoors at golden hour",
    accent: "#c94932",
  },
  {
    number: "04",
    kicker: "Why TI exists",
    title: "Because we belong to one another.",
    teaser: "Care should not stop at the edge of a family, campus, county or familiar face.",
    description: [
      "It is easy to assume someone else will step in. A relative. A neighbour. An institution. Belonging asks a more personal question: what can I do?",
      "Tuokoleane exists to make that answer visible. One big family does not mean erasing our differences. It means refusing to look away when another person needs care.",
    ],
    takeaway: "Their life is not separate from ours.",
    image: "/images/campaign-posters/04-we-belong.jpg",
    imageAlt: "Concept artwork of several generations sharing a meal at one table",
    accent: "#16806f",
  },
  {
    number: "05",
    kicker: "Angels Amongst Us",
    title: "Do the good. Let the good be enough.",
    teaser: "Show up. Make someone smile. Leave them more hopeful than you found them.",
    description: [
      "Not every act of kindness needs a camera, a caption or applause. Sometimes the most powerful care protects a person’s privacy and asks for nothing back.",
      "That is the TI way: help without making yourself the hero. Create a moment of relief, dignity or hope, then let the impact belong to the person who received it.",
    ],
    takeaway: "Become the reason someone believes in people again.",
    image: "/images/campaign-posters/05-angels-among-us.jpg",
    imageAlt: "Concept artwork of a volunteer leaving after a quiet act of care",
    accent: "#8d3e8f",
  },
];

const familyExperiencePhotoNumbers = new Set([
  3, 5, 12, 15, 21, 25, 26, 32, 33, 34, 38, 39, 40, 45, 46, 47, 48, 51, 52, 57, 58, 59, 60, 64, 68, 72, 73,
]);

const tiMomentsPhotoNumbers = new Set([74, 75]);

const galleryPhotoAltByNumber = new Map([
  [74, "Woman smiling while seated and holding a blue cup at a Tuokoleane gathering"],
  [75, "Woman smiling in a black lace top at a Tuokoleane gathering"],
]);

const featuredGalleryPhotoNumbers = [
  51, 75, 74, 10, 40, 29, 6, 57, 35, 65, 59, 13, 37, 26, 7, 68, 44, 12,
];

const excludedGalleryPhotoNumbers = new Set([
  17, 21, 22, 24, 27, 28, 36, 42, 43, 49, 50, 55, 56, 61, 63, 66, 67, 70, 71, 73,
]);

const collapsedGalleryPhotoCount = 5;

const galleryPhotoNumbers = [
  ...featuredGalleryPhotoNumbers,
  ...Array.from({ length: 75 }, (_, index) => index + 1)
    .filter((photoNumber) => !featuredGalleryPhotoNumbers.includes(photoNumber) && !excludedGalleryPhotoNumbers.has(photoNumber)),
];

const galleryPhotos: GalleryPhoto[] = galleryPhotoNumbers.map((photoNumber, index) => {
  const collection = familyExperiencePhotoNumbers.has(photoNumber)
    ? "Family Experience"
    : tiMomentsPhotoNumbers.has(photoNumber)
      ? "TI Moments"
      : "Annual Sharing Day";

  return {
    src: `/images/ti-gallery/ti-gallery-${String(photoNumber).padStart(2, "0")}.jpg`,
    alt: galleryPhotoAltByNumber.get(photoNumber) ?? `Tuokoleane ${collection} archive photograph ${index + 1}`,
    collection,
  };
});

const galleryCollections = ["All Photos", "Annual Sharing Day", "Family Experience", "TI Moments"] as const;
type GalleryCollection = (typeof galleryCollections)[number];

function packagePrice(item: KindnessPackage) {
  if (item.kind === "fixed") return currency.format(item.price ?? 0);
  if (item.kind === "custom") return `${currency.format(item.price ?? 500)} suggested`;
  return "Give your time";
}

function readBasket(): BasketItem[] {
  try {
    const stored = window.localStorage.getItem("ti-kindness-basket");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Array<BasketItem & { package?: KindnessPackage }>;
    return parsed
      .map((entry) => ({
        packageId: entry.packageId ?? entry.package?.id ?? "",
        quantity: Number(entry.quantity) || 1,
        amount: Number(entry.amount) || 0,
      }))
      .filter((entry) => packageById.has(entry.packageId));
  } catch {
    return [];
  }
}

function decodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function AppContent() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [basket, setBasket] = useState<BasketItem[]>(readBasket);
  const [basketOpen, setBasketOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const packageRouteId = path.startsWith("/listing/")
    ? decodeRouteSegment(path.slice("/listing/".length))
    : null;
  const programRouteId = path.startsWith("/program/")
    ? decodeRouteSegment(path.slice("/program/".length))
    : null;
  const routePackage = packageRouteId ? packageById.get(packageRouteId) : undefined;
  const routeProgram = programRouteId ? programById.get(programRouteId) : undefined;

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ti-kindness-basket", JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    const modalOpen = basketOpen || checkoutOpen || Boolean(confirmation);
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [basketOpen, checkoutOpen, confirmation]);

  useEffect(() => {
    applyRouteSeo(path);
  }, [path]);

  const navigate = (nextPath: string, hash?: string) => {
    const destination = `${nextPath}${hash ? `#${hash}` : ""}`;
    if (`${window.location.pathname}${window.location.hash}` !== destination) {
      window.history.pushState({}, "", destination);
      setPath(nextPath);
    }
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const addToBasket = (item: KindnessPackage, amount?: number) => {
    const unitAmount = item.kind === "time" ? 0 : amount ?? item.price ?? 500;
    setBasket((current) => {
      const match = current.find((entry) => entry.packageId === item.id && entry.amount === unitAmount);
      if (match) {
        return current.map((entry) =>
          entry === match ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }
      return [...current, { packageId: item.id, quantity: 1, amount: unitAmount }];
    });
    setBasketOpen(true);
  };

  const updateQuantity = (index: number, delta: number) => {
    setBasket((current) =>
      current
        .map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, quantity: entry.quantity + delta } : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const basketCount = basket.reduce((total, item) => total + item.quantity, 0);
  const basketTotal = basket.reduce((total, item) => total + item.amount * item.quantity, 0);

  const finishDonation = async (submission: DonationSubmission) => {
    const response = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    const result = await response.json().catch(() => null) as (DonationNotificationResponse & { error?: string }) | null;

    if (!response.ok) {
      throw new Error(result?.error ?? "Your details did not reach TI. Please try again.");
    }

    setCheckoutOpen(false);
    setConfirmation({
      reference: result?.reference ?? submission.reference,
      email: submission.donor.email,
      itemCount: basketCount,
      total: donationTotal(submission.items),
      causes: submission.items.map((item) => item.title),
      mpesaReference: submission.mpesaReference,
    });
    setBasket([]);
  };

  const isListingRoute = path.startsWith("/listing/");
  const isProgramRoute = path.startsWith("/program/");
  const isAboutRoute = path === "/about";
  const isGalleryRoute = path === "/gallery";
  const isHomeRoute = path === "/";

  return (
    <div className="app-shell">
      <Header
        basketCount={basketCount}
        currentPath={path}
        expanded={isHomeRoute || isAboutRoute || isGalleryRoute}
        menuOpen={mobileMenuOpen}
        onBasket={() => setBasketOpen(true)}
        onMenu={() => setMobileMenuOpen((open) => !open)}
        onNavigate={navigate}
      />

      {isListingRoute ? (
        routePackage ? (
          <ListingPage item={routePackage} onAdd={addToBasket} onNavigate={navigate} />
        ) : (
          <NotFound onNavigate={navigate} />
        )
      ) : isProgramRoute ? (
        routeProgram ? (
          <ProgramPage program={routeProgram} onNavigate={navigate} />
        ) : (
          <NotFound onNavigate={navigate} />
        )
      ) : isAboutRoute ? (
        <AboutPage onNavigate={navigate} />
      ) : isGalleryRoute ? (
        <GalleryPage />
      ) : isHomeRoute ? (
        <HomePage onNavigate={navigate} />
      ) : (
        <NotFound onNavigate={navigate} />
      )}

      <Footer onNavigate={navigate} />

      {basketOpen && (
        <BasketDrawer
          basket={basket}
          total={basketTotal}
          onClose={() => setBasketOpen(false)}
          onExplore={() => {
            setBasketOpen(false);
            navigate("/", "marketplace");
          }}
          onQuantity={updateQuantity}
          onCheckout={() => {
            setBasketOpen(false);
            setCheckoutOpen(true);
          }}
        />
      )}

      {checkoutOpen && (
        <Checkout
          basket={basket}
          total={basketTotal}
          onBack={() => {
            setCheckoutOpen(false);
            setBasketOpen(true);
          }}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={finishDonation}
        />
      )}

      {confirmation && (
        <div className="modal-backdrop confirmation-backdrop" role="presentation">
          <section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <span className="success-icon"><Check size={32} /></span>
            <p className="eyebrow">{confirmation.total > 0 ? "Your details reached TI" : "Your interest reached TI"}</p>
            <h2 id="confirmation-title">Thank you for choosing to help.</h2>
            <p>
              TI has received your details for {confirmation.itemCount} {confirmation.itemCount === 1 ? "way to help" : "ways to help"}. Keep this reference in case you need to contact the team: <strong>{confirmation.reference}</strong>.
            </p>
            <div className="confirmation-next">
              <strong>{confirmation.total > 0 ? "What happens now" : "The TI team will follow up"}</strong>
              <span>
                {confirmation.total > 0
                  ? `TI will match M-PESA code ${confirmation.mpesaReference} with its payment records before confirming your ${confirmation.causes.join(", ")} donation by email.`
                  : `TI will contact you at ${confirmation.email} to talk through availability, fit and what happens next. Please wait for the team before making any visit or volunteer arrangement.`}
              </span>
            </div>
            <button className="primary-button full" onClick={() => setConfirmation(null)}>Back to the marketplace</button>
          </section>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

interface HeaderProps {
  basketCount: number;
  currentPath: string;
  expanded: boolean;
  menuOpen: boolean;
  onBasket: () => void;
  onMenu: () => void;
  onNavigate: (path: string, hash?: string) => void;
}

function Brand({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }} aria-label="Tuokoleane Initiative home">
      <BrandLogo className="brand-logo" alt="" aria-hidden="true" />
    </a>
  );
}

const headerDestinations = [
  { label: "Give", path: "/", hash: "marketplace", image: "/images/nav-thumbnails/give.jpg" },
  { label: "About TI", path: "/about", image: "/images/nav-thumbnails/about.jpg" },
  { label: "Gallery", path: "/gallery", image: "/images/nav-thumbnails/gallery.jpg" },
  { label: "How it works", path: "/", hash: "how-it-works", image: "/images/nav-thumbnails/how-it-works.jpg" },
];

function ThemeControl({ placement }: { placement: "header" | "menu" }) {
  const { preference, setPreference } = useTheme();
  const ThemeIcon = preference === "light" ? Sun : preference === "dark" ? Moon : Monitor;

  return (
    <label className={`theme-control theme-control-${placement}`}>
      <ThemeIcon aria-hidden="true" size={17} />
      <span className="sr-only">Colour theme</span>
      <select
        aria-label="Colour theme"
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <ChevronDown aria-hidden="true" size={15} />
    </label>
  );
}

function Header({ basketCount, currentPath, expanded, menuOpen, onBasket, onMenu, onNavigate }: HeaderProps) {
  const routeLink = (event: React.MouseEvent<HTMLAnchorElement>, path: string, hash?: string) => {
    event.preventDefault();
    onNavigate(path, hash);
  };

  return (
    <header className={`site-header${expanded ? " site-header-expanded" : ""}`}>
      <div className="header-main">
        <Brand onNavigate={onNavigate} />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {headerDestinations.map((destination) => {
            const active = destination.path === "/"
              ? currentPath === "/" && destination.hash === "marketplace"
              : currentPath === destination.path;
            return (
            <a
              className={active ? "nav-destination nav-destination-active" : "nav-destination"}
              href={`${destination.path}${destination.hash ? `#${destination.hash}` : ""}`}
              key={destination.label}
              onClick={(event) => routeLink(event, destination.path, destination.hash)}
              aria-current={active ? "page" : undefined}
            >
              <span className="nav-destination-image" aria-hidden="true">
                <img src={destination.image} alt="" />
              </span>
              <span>{destination.label}</span>
            </a>
            );
          })}
        </nav>
        <div className="header-actions">
          <ThemeControl placement="header" />
          <button className="basket-button" onClick={onBasket} aria-label={`Open your basket with ${basketCount} items`}>
            <ShoppingBag size={18} />
            <span>Basket</span>
            {basketCount > 0 && <b>{basketCount}</b>}
          </button>
          <button className="menu-button" onClick={onMenu} aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {expanded && (
        <nav className="discovery-bar" aria-label="Explore Tuokoleane">
          <a href="/#marketplace" onClick={(event) => routeLink(event, "/", "marketplace")}>
            <strong>What can I do?</strong>
            <span>Find one useful way to help</span>
          </a>
          <a href="/#how-it-works" onClick={(event) => routeLink(event, "/", "how-it-works")}>
            <strong>How does it work?</strong>
            <span>See what happens after you choose</span>
          </a>
          <a href="/#programs" onClick={(event) => routeLink(event, "/", "programs")}>
            <strong>Who makes it happen?</strong>
            <span>Meet TI’s programmes and events</span>
          </a>
          <a className="discovery-search" href="/#marketplace" onClick={(event) => routeLink(event, "/", "marketplace")} aria-label="Browse all ways to help">
            <Search size={22} strokeWidth={2.4} />
          </a>
        </nav>
      )}
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {headerDestinations.map((destination) => (
            <a href={`${destination.path}${destination.hash ? `#${destination.hash}` : ""}`} key={destination.label} onClick={(event) => routeLink(event, destination.path, destination.hash)}>
              <span className="nav-destination-image" aria-hidden="true"><img src={destination.image} alt="" /></span>
              <span>{destination.label}</span>
            </a>
          ))}
          <ThemeControl placement="menu" />
        </nav>
      )}
    </header>
  );
}

function HomePage({ onNavigate }: { onNavigate: (path: string, hash?: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
  }, []);

  const filteredPackages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return kindnessPackages.filter((item) => {
      const categoryMatches = activeCategory === "All" || item.category === activeCategory;
      const queryMatches = !normalizedQuery || [item.title, item.shortDescription, item.category, item.program]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return categoryMatches && queryMatches;
    });
  }, [activeCategory, query]);

  const searchMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return kindnessPackages.slice(0, 6);

    return kindnessPackages.filter((item) => [
      item.title,
      item.shortDescription,
      item.description,
      item.category,
      item.program,
      item.label,
    ].join(" ").toLowerCase().includes(normalizedQuery)).slice(0, 8);
  }, [query]);

  const chooseSearchResult = (item: KindnessPackage) => {
    setSearchOpen(false);
    setActiveSearchIndex(-1);
    onNavigate(`/listing/${item.id}`);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setActiveSearchIndex(-1);
      return;
    }

    if (!searchMatches.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((index) => Math.min(index + 1, searchMatches.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((index) => index <= 0 ? 0 : index - 1);
      return;
    }

    if (event.key === "Enter" && searchOpen) {
      const selectedMatch = searchMatches[activeSearchIndex];
      if (selectedMatch) {
        event.preventDefault();
        chooseSearchResult(selectedMatch);
      }
    }
  };

  return (
    <main id="top">
      <section className="home-hero" aria-label="Tuokoleane Catalogue of Kindness">
        <img
          className="home-hero-image"
          src="/images/hero/tuokoleane-family-table-1774.jpg"
          srcSet="/images/hero/tuokoleane-family-table-640.jpg 640w, /images/hero/tuokoleane-family-table-960.jpg 960w, /images/hero/tuokoleane-family-table-1774.jpg 1774w"
          sizes="100vw"
          width="1774"
          height="888"
          fetchPriority="high"
          alt="Friends sharing a meal around a family table"
        />
        <div className="home-hero-copy page-width">
          <h1>What if Doing Charity was as easy as shopping online?</h1>
          <p className="hero-lede">Welcome to the Amazon of Charity. A place where anyone, anywhere, can find a way to Give. Share. Care.</p>
          <div className="hero-actions">
            <button className="primary-button hero-primary" onClick={() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" })}>
              Become An Angel <ArrowRight size={18} />
            </button>
            <button className="hero-secondary" onClick={() => onNavigate("/about")}>Angel&apos;s Amongst Us</button>
          </div>
        </div>
      </section>

      <section className="marketplace page-width" id="marketplace">
        <div className="section-heading">
          <h2>What do you have to give?</h2>
        </div>
        <div className="marketplace-toolbar">
          <div
            className="listing-search"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setSearchOpen(false);
                setActiveSearchIndex(-1);
              }
            }}
          >
            <label className="search-field">
              <Search size={18} />
              <span className="sr-only">Search ways to help</span>
              <input
                type="search"
                role="combobox"
                aria-label="Search ways to help"
                aria-expanded={searchOpen}
                aria-controls="listing-search-results"
                aria-autocomplete="list"
                aria-activedescendant={activeSearchIndex >= 0 ? `listing-search-option-${searchMatches[activeSearchIndex]?.id}` : undefined}
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                  setActiveSearchIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search meals, school shoes, groceries..."
              />
            </label>
            {searchOpen && (
              <div className="listing-search-results" id="listing-search-results" role="listbox" aria-label="Listing search results">
                {searchMatches.length ? searchMatches.map((item, index) => (
                  <button
                    type="button"
                    role="option"
                    id={`listing-search-option-${item.id}`}
                    aria-selected={index === activeSearchIndex}
                    className={index === activeSearchIndex ? "active" : ""}
                    onMouseEnter={() => setActiveSearchIndex(index)}
                    onClick={() => chooseSearchResult(item)}
                    key={item.id}
                  >
                    <span className="listing-search-icon" aria-hidden="true"><item.icon size={22} /></span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.category} · {item.program}</small>
                    </span>
                    <b>{packagePrice(item)}</b>
                  </button>
                )) : (
                  <div className="listing-search-empty">
                    <Search size={18} />
                    <span>We could not find anything for “{query.trim()}”.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="category-tabs" aria-label="Filter by category">
            {categories.map((category) => (
              <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
        </div>
        {filteredPackages.length ? (
          <>
            <MobileCatalogue items={filteredPackages} onNavigate={onNavigate} />
            <div className="package-grid">
              {filteredPackages.map((item) => <PackageCard key={item.id} item={item} onNavigate={onNavigate} />)}
            </div>
          </>
        ) : (
          <div className="empty-results">
            <Search size={26} />
            <h3>Nothing here yet</h3>
            <p>Try another search or choose a different category.</p>
            <button onClick={() => { setQuery(""); setActiveCategory("All"); }}>Show everything</button>
          </div>
        )}
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-width how-grid">
          <div>
            <p className="eyebrow">From choosing to helping</p>
            <h2>Know what happens next.</h2>
          </div>
          <ol className="steps-list">
            <li><span>1</span><div><strong>Choose what feels right</strong><p>Open any listing to see what your money, time or goods can support.</p></div></li>
            <li><span>2</span><div><strong>TI checks the details</strong><p>The local team confirms the payment, activity or current need before moving ahead.</p></div></li>
            <li><span>3</span><div><strong>Hear what happened</strong><p>When TI has an update it can share, the team will send it to you.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="programs page-width" id="programs">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Programmes and events</p>
          <h2>One initiative. Several ways to belong.</h2>
        </div>
        <div className="program-grid">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} onNavigate={onNavigate} />
          ))}
        </div>
        <MobilePrograms programs={programs} onNavigate={onNavigate} />
      </section>
      <ValuesSection />
      <ReachSection />
    </main>
  );
}

function ValuesSection() {
  return (
    <section className="values-section" id="values">
      <div className="page-width values-heading">
        <h2><span>Dignity over display.</span><span>Clarity over vague promises.</span><span>Belonging over pity.</span></h2>
      </div>
      <div className="page-width values-infographic">
        <article className="value-card value-card-primary">
          <span className="value-number">01</span>
          <div className="value-orbits" aria-hidden="true"><i /><i /><i /><Heart fill="currentColor" /></div>
          <div><p>Start where you are</p><h3>Give</h3><span>Offer what you can. A meal, a book or a little money can mean a lot.</span></div>
        </article>
        <article className="value-card value-card-share">
          <span className="value-number">02</span>
          <div className="value-line" aria-hidden="true"><i /><i /><i /></div>
          <div><p>More than money</p><h3>Share</h3><span>Pass on your time, skills or something useful. Someone may need exactly that.</span></div>
        </article>
        <article className="value-card value-card-care">
          <span className="value-number">03</span>
          <div className="value-people" aria-hidden="true"><i /><i /><i /></div>
          <div><p>Be there</p><h3>Care</h3><span>Show up, listen and check in. Sometimes being there is the help.</span></div>
        </article>
        <article className="value-card value-card-kindness">
          <span className="value-number">04</span>
          <div className="value-kindness" aria-hidden="true"><Heart fill="currentColor" /></div>
          <div><p>Keep it human</p><h3>Love &amp; Kindness</h3><span>Do the thoughtful thing, even when no one is watching. Kindness needs no audience.</span></div>
        </article>
      </div>
      <div className="page-width">
        <p className="kindness-mantra"><span>If you cannot <b>Give</b>, <b>Share</b>.</span><span>If you cannot <b>Share</b>, <b>Care</b>.</span><em>Dare to Care.</em></p>
      </div>
      <div className="page-width model-stats" aria-label="Catalogue overview">
        <div><strong>{kindnessPackages.length}</strong><span>practical ways to help</span></div>
        <div><strong>3</strong><span>ways to give: money, time or goods</span></div>
        <div><strong>{currency.format(20)}</strong><span>starting contribution</span></div>
      </div>
    </section>
  );
}

function ReachSection() {
  return (
    <section className="reach-section" aria-labelledby="reach-title">
      <div className="page-width reach-heading">
        <p className="eyebrow">Where TI has shown up</p>
        <h2 id="reach-title">Touching lives across campuses and counties.</h2>
      </div>
      <div className="reach-marquee" role="region" aria-label="Places and communities reached">
        <div className="reach-track">
          {[0, 1].map((set) => (
            <div className="reach-set" key={set} aria-hidden={set === 1}>
              {placesReached.map((place) => (
                <span className="reach-mark" key={`${set}-${place.name}`}>
                  <img className="reach-logo" src={place.logo} alt={`${place.name} official logo`} loading="lazy" decoding="async" />
                  <span>{place.name}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPage({ onNavigate }: { onNavigate: (path: string, hash?: string) => void }) {
  const [selectedIdea, setSelectedIdea] = useState<CampaignIdea | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
  }, []);

  useEffect(() => {
    if (!selectedIdea) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIdea(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIdea]);

  const browseFromIdea = () => {
    setSelectedIdea(null);
    onNavigate("/", "marketplace");
  };

  return (
    <main id="top">
      <section className="program-hero page-width" aria-labelledby="about-ti-title">
        <div className="program-hero-copy">
          <p className="eyebrow">Who we are</p>
          <h1 id="about-ti-title">We belong to one another.</h1>
          <p>Tuokoleane brings people together to share practical help, look out for one another and treat every person with dignity.</p>
        </div>
        <figure className="program-hero-media">
          <img src="/images/ti-gallery/ti-gallery-51.jpg" alt="Tuokoleane community members spending time together" />
        </figure>
      </section>

      <section className="campaign-section" aria-labelledby="campaign-title">
        <div className="page-width">
          <div className="campaign-heading">
            <div><p className="eyebrow">Why this work matters</p><h2 id="campaign-title">Kindness becomes real when it becomes specific.</h2></div>
            <p>Five reasons to stop waiting for the perfect moment and start with one useful act.</p>
          </div>
          <div className="campaign-grid" aria-label="Ideas behind Tuokoleane">
            {campaignIdeas.map((idea) => (
              <button className="campaign-card" onClick={() => setSelectedIdea(idea)} aria-haspopup="dialog" aria-label={`Read ${idea.title}`} style={{ "--campaign-accent": idea.accent } as React.CSSProperties} key={idea.number}>
                <span className="campaign-card-media">
                  <img src={idea.image} alt={idea.imageAlt} loading="lazy" decoding="async" />
                  <b aria-hidden="true">{idea.number}</b>
                </span>
                <span className="campaign-card-body">
                  <small>{idea.kicker}</small>
                  <strong>{idea.title}</strong>
                  <span>{idea.teaser}</span>
                  <em>Read the idea <ChevronRight size={17} /></em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="manifesto-section">
        <div className="page-width manifesto-grid">
          <div><p className="eyebrow">The Tuokoleane way</p><h2>Do good without needing applause.</h2></div>
          <div><p>Help without turning someone’s life into a performance. Make the promise clear. Let the person receiving care keep their privacy, choices and voice.</p><button className="primary-button manifesto-button" onClick={() => onNavigate("/", "marketplace")}>Choose one useful act <ArrowRight size={18} /></button></div>
        </div>
      </section>

      <ValuesSection />
      <ReachSection />

      {selectedIdea && (
        <div className="campaign-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedIdea(null)}>
          <section className="campaign-dialog" role="dialog" aria-modal="true" aria-labelledby={`campaign-dialog-title-${selectedIdea.number}`} style={{ "--campaign-accent": selectedIdea.accent } as React.CSSProperties}>
            <button className="campaign-dialog-close" onClick={() => setSelectedIdea(null)} aria-label="Close idea" autoFocus><X size={21} /></button>
            <div className="campaign-dialog-media">
              <img src={selectedIdea.image} alt={selectedIdea.imageAlt} />
              <span>Concept artwork</span>
            </div>
            <div className="campaign-dialog-copy">
              <p className="eyebrow">{selectedIdea.number} · {selectedIdea.kicker}</p>
              <h2 id={`campaign-dialog-title-${selectedIdea.number}`}>{selectedIdea.title}</h2>
              <p className="campaign-dialog-lede">{selectedIdea.teaser}</p>
              <div className="campaign-dialog-description">{selectedIdea.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <blockquote>{selectedIdea.takeaway}</blockquote>
              <button className="primary-button" onClick={browseFromIdea}>Browse practical ways to help <ArrowRight size={18} /></button>
              <p className="campaign-dialog-note">Choose a listing to give money or offer your time. TI checks every payment and volunteer opportunity before anything is arranged.</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function GalleryPage() {
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [activeGalleryCollection, setActiveGalleryCollection] = useState<GalleryCollection>("All Photos");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const filteredGalleryPhotos = activeGalleryCollection === "All Photos"
    ? galleryPhotos
    : galleryPhotos.filter((photo) => photo.collection === activeGalleryCollection);
  const visibleGalleryPhotos = galleryExpanded
    ? filteredGalleryPhotos
    : filteredGalleryPhotos.slice(0, collapsedGalleryPhotoCount);
  const selectedGalleryPhoto = selectedGalleryIndex === null ? null : galleryPhotos[selectedGalleryIndex];

  useEffect(() => {
    if (selectedGalleryIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGalleryIndex(null);
      if (event.key === "ArrowLeft") {
        setSelectedGalleryIndex((current) => current === null ? null : (current - 1 + galleryPhotos.length) % galleryPhotos.length);
      }
      if (event.key === "ArrowRight") {
        setSelectedGalleryIndex((current) => current === null ? null : (current + 1) % galleryPhotos.length);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedGalleryIndex]);

  const showPreviousGalleryPhoto = () => {
    setSelectedGalleryIndex((current) => current === null ? null : (current - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const showNextGalleryPhoto = () => {
    setSelectedGalleryIndex((current) => current === null ? null : (current + 1) % galleryPhotos.length);
  };

  return (
    <main id="top">
      <section className="ti-gallery-section" aria-labelledby="ti-gallery-title">
        <div className="page-width">
          <div className="ti-gallery-heading">
            <div>
              <p className="eyebrow"><Images size={15} /> Real moments. One big family.</p>
              <h1 className="ti-gallery-title" id="ti-gallery-title">Tuokoleane Initiative Gallery</h1>
            </div>
            <p>Moments of welcome, shared time and community from the Tuokoleane Annual Sharing Day, TI Family Experience and other shared TI moments.</p>
          </div>

          <div className="ti-gallery-toolbar" aria-label="Gallery collections">
            <div className="ti-gallery-tabs" role="group" aria-label="Filter photos by collection">
              {galleryCollections.map((collection) => {
                const photoCount = collection === "All Photos"
                  ? galleryPhotos.length
                  : galleryPhotos.filter((photo) => photo.collection === collection).length;
                return (
                  <button
                    className={activeGalleryCollection === collection ? "active" : ""}
                    type="button"
                    aria-pressed={activeGalleryCollection === collection}
                    onClick={() => {
                      setActiveGalleryCollection(collection);
                      setGalleryExpanded(false);
                    }}
                    key={collection}
                  >
                    <span>{collection}</span>
                    <small>{photoCount}</small>
                  </button>
                );
              })}
            </div>
            <p>{filteredGalleryPhotos.length} photographs</p>
          </div>

          <div className="ti-gallery-grid" aria-label="Tuokoleane Initiative photographs">
            {visibleGalleryPhotos.map((photo, index) => (
              <button
                className="ti-gallery-card"
                key={photo.src}
                onClick={() => setSelectedGalleryIndex(galleryPhotos.indexOf(photo))}
                aria-haspopup="dialog"
                aria-label={`Open gallery photo ${index + 1} of ${filteredGalleryPhotos.length}`}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>

          {filteredGalleryPhotos.length > collapsedGalleryPhotoCount && (
            <div className="ti-gallery-more">
              <button className="secondary-button" onClick={() => setGalleryExpanded((expanded) => !expanded)}>
                <Images size={18} /> {galleryExpanded ? "Show fewer photos" : `View all ${filteredGalleryPhotos.length} photos`}
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedGalleryPhoto && selectedGalleryIndex !== null && (
        <div className="ti-gallery-lightbox" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedGalleryIndex(null)}>
          <section className="ti-gallery-dialog" role="dialog" aria-modal="true" aria-labelledby="ti-gallery-dialog-title">
            <header className="ti-gallery-dialog-header">
              <div>
                <strong id="ti-gallery-dialog-title">{selectedGalleryPhoto.collection}</strong>
                <span>{selectedGalleryIndex + 1} / {galleryPhotos.length}</span>
              </div>
              <button className="ti-gallery-close" onClick={() => setSelectedGalleryIndex(null)} aria-label="Close gallery photo" autoFocus><X size={22} /></button>
            </header>
            <div className="ti-gallery-stage">
              <button className="ti-gallery-previous" onClick={showPreviousGalleryPhoto} aria-label="Previous gallery photo"><ArrowLeft size={24} /></button>
              <figure>
                <img src={selectedGalleryPhoto.src} alt={selectedGalleryPhoto.alt} decoding="async" />
              </figure>
              <button className="ti-gallery-next" onClick={showNextGalleryPhoto} aria-label="Next gallery photo"><ArrowRight size={24} /></button>
            </div>
            <div className="ti-gallery-filmstrip" aria-label="Choose a gallery photo">
              {galleryPhotos.map((photo, index) => (
                <button
                  className={selectedGalleryIndex === index ? "active" : ""}
                  type="button"
                  aria-label={`View photo ${index + 1} of ${galleryPhotos.length}`}
                  aria-current={selectedGalleryIndex === index ? "true" : undefined}
                  onClick={() => setSelectedGalleryIndex(index)}
                  key={photo.src}
                >
                  <img src={photo.src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function ProgramCard({ program, onNavigate }: { program: Program; onNavigate: (path: string) => void }) {
  const path = `/program/${program.id}`;
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <article className={`program-card${program.featured ? " program-card-featured" : ""}`} style={{ "--program-accent": program.accent } as React.CSSProperties}>
      <a className="program-card-photo" href={path} onClick={open} aria-label={`Explore ${program.name}`}>
        <img src={program.image} alt={program.imageAlt} loading="lazy" decoding="async" />
        {program.featured && <b className="program-featured-badge">Featured annual event</b>}
      </a>
      <div className="program-card-body">
        <div className="program-card-number">{program.number}</div>
        <p>{program.kicker}</p>
        <h3><a href={path} onClick={open}>{program.name}</a></h3>
        {program.eventDate && <time className="program-event-date" dateTime={program.eventDateIso}><CalendarDays size={14} /> {program.eventDateShort ?? program.eventDate}</time>}
        <p className="program-card-summary">{program.summary}</p>
        <div className="program-tags" aria-label={`${program.name} activities`}>
          {program.activities.slice(0, 2).map((activity) => <span key={activity}>{activity}</span>)}
        </div>
        <a className="program-card-link" href={path} onClick={open}>Learn more <ChevronRight size={17} /></a>
      </div>
    </article>
  );
}

function ProgramPage({ program, onNavigate }: { program: Program; onNavigate: (path: string, hash?: string) => void }) {
  const relatedPackages = program.relatedPackageIds
    .map((id) => packageById.get(id))
    .filter((item): item is KindnessPackage => Boolean(item))
    .slice(0, 3);

  return (
    <main className="program-page" style={{ "--program-accent": program.accent } as React.CSSProperties}>
      <div className="program-page-shell page-width">
        <nav aria-label="Breadcrumb">
          <a className="back-link" href="/#programs" onClick={(event) => { event.preventDefault(); onNavigate("/", "programs"); }}><ArrowLeft size={18} /> All initiatives</a>
          <span className="sr-only" aria-current="page">{program.name}</span>
        </nav>
        <section className="program-hero">
          <div className="program-hero-copy">
            <p className="eyebrow">{program.number} · {program.kicker}</p>
            <h1>{program.name}</h1>
            {program.eventDate && <time className="program-page-date" dateTime={program.eventDateIso}><CalendarDays size={17} /> {program.eventDate}</time>}
            <p>{program.summary}</p>
          </div>
          <figure className="program-hero-media">
            <img src={program.image} alt={program.imageAlt} />
          </figure>
        </section>

        <section className="program-overview">
          <p className="eyebrow">Why this programme exists</p>
          <p>{program.overview}</p>
        </section>

        <section className="program-detail-grid" aria-label={`${program.name} details`}>
          <article><span>01</span><h2>What happens here</h2><ul>{program.activities.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>
          <article><span>02</span><h2>What we hope it builds</h2><ul>{program.intendedOutcomes.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>
          <article><span>03</span><h2>How TI keeps track</h2><ul>{program.measurements.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>
        </section>

        {program.galleryImages && program.galleryImages.length > 0 && (
          <section className="program-gallery" aria-labelledby="program-gallery-title">
            <div className="section-heading">
              <h2 id="program-gallery-title">Moments from {program.name}.</h2>
            </div>
            <div className="program-gallery-grid">
              {program.galleryImages.map((image) => <img src={image.src} alt={image.alt} loading="lazy" decoding="async" key={image.src} />)}
            </div>
            {program.participationHref && program.participationLabel && (
              <div className="program-participation">
                <a className="primary-button" href={program.participationHref}>{program.participationLabel} <ArrowRight size={18} /></a>
                {program.participationNote && <p>{program.participationNote}</p>}
              </div>
            )}
          </section>
        )}

        {relatedPackages.length > 0 && (
          <section className="program-related">
            <div className="section-heading">
              <p className="eyebrow">Take part in this work</p>
              <h2>Choose how you would like to help.</h2>
              <p>Give towards something practical or tell TI you would like to offer your time.</p>
            </div>
            <div className="related-grid">{relatedPackages.map((item) => <PackageCard key={item.id} item={item} onNavigate={onNavigate} />)}</div>
          </section>
        )}

        <section className="program-scope">
          <ShieldCheck size={22} />
          <div><strong>What TI can promise</strong><p>These are goals the team is working towards, not reports of impact that has already happened. TI checks donations and volunteer opportunities before using funds or arranging an activity.</p></div>
        </section>
      </div>
    </main>
  );
}

function PackageCard({ item, onNavigate }: { item: KindnessPackage; onNavigate: (path: string) => void }) {
  const path = `/listing/${item.id}`;
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <article className={`package-card${item.featured ? " package-card-featured" : ""}`}>
      <a className="package-photo-link" href={path} onClick={open} aria-label={`View ${item.title}`}>
        <img src={item.images[0].src} alt={item.images[0].alt} loading="lazy" decoding="async" />
        {item.specialBadge && <span className="package-badge">{item.specialBadge}</span>}
        {item.eventDate && (
          <time className="package-event-date" dateTime={item.eventDateIso}>
            <CalendarDays size={13} /> {item.eventDateShort ?? item.eventDate}
          </time>
        )}
      </a>
      <FavoriteButton className="desktop-listing-favourite" itemId={item.id} itemTitle={item.title} />
      <div className="package-body">
        <div className="package-title-row">
          <a href={path} onClick={open}><h3>{item.title}</h3></a>
          <strong>{packagePrice(item)}</strong>
        </div>
        <p>{item.shortDescription}</p>
        <div className="package-meta">
          <span>{item.program}</span>
          <span>{item.priceUnit ? <Ticket size={14} /> : <Clock3 size={14} />} {item.priceUnit ?? item.duration}</span>
        </div>
      </div>
    </article>
  );
}

function PaymentBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`payment-badges${compact ? " payment-badges-compact" : ""}`} aria-label="Supported mobile money methods">
      <img className="payment-badge-wide" src="/images/payment-badges/mpesa.svg" alt="M-PESA" />
      <img src="/images/payment-badges/tkash.jpg" alt="T-Kash" />
      <img src="/images/payment-badges/airtel-money.png" alt="Airtel Money" />
    </div>
  );
}

function ListingPage({ item, onAdd, onNavigate }: { item: KindnessPackage; onAdd: (item: KindnessPackage, amount?: number) => void; onNavigate: (path: string, hash?: string) => void }) {
  const [customAmount, setCustomAmount] = useState(String(item.price ?? 500));
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    setCustomAmount(String(item.price ?? 500));
    setGalleryOpen(false);
  }, [item.id]);

  useEffect(() => {
    document.body.style.overflow = galleryOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [galleryOpen]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: item.title, url });
      else await navigator.clipboard.writeText(url);
      setShareLabel("Copied");
      window.setTimeout(() => setShareLabel("Share"), 1800);
    } catch {
      setShareLabel("Share");
    }
  };

  const amount = item.kind === "time" ? 0 : Number(customAmount) || 0;
  const minimumAmount = item.minimumAmount ?? 20;
  const isEvent = Boolean(item.eventDate);
  const related = kindnessPackages.filter((candidate) => candidate.id !== item.id && candidate.category === item.category).slice(0, 3);
  const fallbackRelated = related.length >= 3 ? related : [...related, ...kindnessPackages.filter((candidate) => candidate.id !== item.id && !related.includes(candidate))].slice(0, 3);

  return (
    <main className="listing-page">
      <div className="listing-shell page-width">
        <div className="listing-topline">
          <nav aria-label="Breadcrumb">
            <a className="back-link" href="/#marketplace" onClick={(event) => { event.preventDefault(); onNavigate("/", "marketplace"); }}><ArrowLeft size={18} /> All ways to help</a>
            <span className="sr-only" aria-current="page">{item.title}</span>
          </nav>
          <div className="listing-actions">
            <button onClick={share}><Share2 size={17} /> {shareLabel}</button>
            <FavoriteButton className="listing-page-favourite" itemId={item.id} itemTitle={item.title} showText />
          </div>
        </div>
        <div className="listing-heading">
          <div className="listing-kicker-row">
            <p className="eyebrow">{item.program}</p>
            {item.featured && <span className="listing-featured-badge">Featured annual event</span>}
          </div>
          <h1>{item.title}</h1>
          <p className="listing-lede">{item.shortDescription}</p>
          {item.eventDate && (
            <div className="listing-event-date">
              <CalendarDays size={18} />
              <span>Event date</span>
              <time dateTime={item.eventDateIso}>{item.eventDate}</time>
            </div>
          )}
        </div>

        <div className="photo-grid">
          {item.images.map((image, index) => (
            <button key={image.src} className={`photo-tile photo-${index + 1}`} onClick={() => setGalleryOpen(true)} aria-label={`Open photo ${index + 1} of ${item.images.length}`}>
              <img src={image.src} alt={image.alt} />
            </button>
          ))}
          <button className="show-photos" onClick={() => setGalleryOpen(true)}><Images size={17} /> Show all photos</button>
        </div>

        <div className="listing-content-grid">
          <div className="listing-content">
            <section className="listing-intro">
              <div>
                <h2>{isEvent ? `Annual Gala · ${item.category}` : `${item.label} · ${item.category}`}</h2>
                <p>Coordinated in Kenya by Tuokoleane Initiative</p>
              </div>
              <span className="coordinator-mark" aria-label="Tuokoleane coordinated"><BrandLogo variant="symbol" className="brand-symbol" alt="" aria-hidden="true" /></span>
            </section>

            <section className="listing-highlights" aria-label="Listing highlights">
              <div><CheckCircle2 /><span><strong>Is this for you?</strong><small>{item.suitableFor}</small></span></div>
              <div><Users /><span><strong>Handled by the TI team</strong><small>{item.coordination}</small></span></div>
              <div><ShieldCheck /><span><strong>Before anything happens</strong><small>{isEvent ? "The ticket covers admission. Any auction pledge is separate and entirely voluntary." : "TI checks the need or activity before making a promise to anyone."}</small></span></div>
            </section>

            <section className="listing-section">
              <h2>What you are helping with</h2>
              <p>{item.description}</p>
            </section>

            <section className="listing-section">
              <h2>{isEvent ? "What your ticket includes" : item.kind === "time" ? "What your offer includes" : "What your donation includes"}</h2>
              <ul className="feature-list">
                {item.includes.map((entry) => <li key={entry}><Check size={18} /> {entry}</li>)}
              </ul>
            </section>

            <section className="listing-section">
              <h2>Good to know</h2>
              <ul className="plain-list">{item.goodToKnow.map((entry) => <li key={entry}>{entry}</li>)}</ul>
            </section>

            <section className="listing-section impact-section">
              <p className="eyebrow">What happens next</p>
              <ol>
                {isEvent ? (
                  <>
                    <li><span>1</span><div><strong>You add your seat</strong><p>Add one or more tickets to your basket and pay the total to the TI M-PESA Till.</p></div></li>
                    <li><span>2</span><div><strong>You send the payment details</strong><p>Enter your M-PESA confirmation code so the TI team can match your ticket payment.</p></div></li>
                    <li><span>3</span><div><strong>TI confirms your place</strong><p>The team checks the payment and shares the venue, programme and final attendance details.</p></div></li>
                  </>
                ) : item.kind === "time" ? (
                  <>
                    <li><span>1</span><div><strong>Tell TI you are interested</strong><p>Add the activity to your basket and share the best way to reach you.</p></div></li>
                    <li><span>2</span><div><strong>TI checks the details</strong><p>The team looks at the current need, timing, fit and safeguarding requirements.</p></div></li>
                    <li><span>3</span><div><strong>Plan it together</strong><p>TI contacts you before arranging a visit, session or volunteer activity.</p></div></li>
                  </>
                ) : (
                  <>
                    <li><span>1</span><div><strong>Choose what you want to give</strong><p>Add the cause to your basket and pay the total to the TI M-PESA Till.</p></div></li>
                    <li><span>2</span><div><strong>Share your M-PESA code</strong><p>Enter the confirmation code so the TI team can find your payment.</p></div></li>
                    <li><span>3</span><div><strong>TI takes it from there</strong><p>The team checks the payment and current need, then follows up by email.</p></div></li>
                  </>
                )}
              </ol>
            </section>
          </div>

          <aside className="pledge-card" aria-label={item.actionLabel ?? (item.kind === "time" ? "Share your interest" : "Make a donation")}>
            <div className="pledge-price"><strong>{item.kind === "time" ? packagePrice(item) : currency.format(item.price ?? 500)}</strong><span>{item.kind === "time" ? item.duration : item.priceUnit ?? "suggested contribution"}</span></div>
            {item.kind !== "time" && (
              <label className="amount-field">
                <span>Want to contribute a different amount?</span>
                <small>Enter an amount from as low as KSh 20.</small>
                <div><b>KSh</b><input inputMode="numeric" value={customAmount} onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ""))} aria-label="Contribution amount in Kenyan shillings" /></div>
              </label>
            )}
            {item.kind === "fixed" && amount < (item.price ?? 0) && amount >= minimumAmount && <p className="contribution-note">This will go towards the item. TI may combine it with other contributions to cover the full cost.</p>}
            <div className="pledge-summary">
              {isEvent ? (
                <>
                  <span>Event date</span><strong><time dateTime={item.eventDateIso}>{item.eventDate}</time></strong>
                  <span>Ticket</span><strong>{packagePrice(item)}</strong>
                </>
              ) : (
                <>
                  <span>Programme</span><strong>{item.program}</strong>
                  <span>Commitment</span><strong>{item.kind === "time" ? item.duration : amount ? currency.format(amount) : "Choose amount"}</strong>
                </>
              )}
            </div>
            <section className="listing-payment-details" aria-label="Payment details">
              <div className="listing-payment-heading"><strong>{item.kind === "time" ? "Want to donate as well?" : "How to pay"}</strong><PaymentBadges compact /></div>
              <dl>
                <div><dt>M-PESA Till</dt><dd>{TI_PAYMENT_DETAILS.tillNumber}</dd></div>
                <div><dt>Account name</dt><dd>{TI_PAYMENT_DETAILS.accountName}</dd></div>
              </dl>
              <p>
                {item.kind === "time"
                  ? "You do not need to pay to offer your time. If you would also like to donate, use these details and keep your confirmation message."
                  : <>After you pay, forward the M-PESA message to <a href={`sms:${TI_PAYMENT_DETAILS.confirmationPhoneLink}`}>{TI_PAYMENT_DETAILS.confirmationPhoneDisplay}</a>. You will enter the confirmation code at checkout.</>}
              </p>
            </section>
            <button className="primary-button full" disabled={item.kind !== "time" && amount < minimumAmount} onClick={() => onAdd(item, amount)}>
              {item.actionLabel ?? (item.kind === "time" ? "Add to my plan" : "Add to basket")}
            </button>
            {item.kind !== "time" && amount < minimumAmount && <p className="field-error">Enter at least {currency.format(minimumAmount)}.</p>}
          </aside>
        </div>

        <section className="related-section">
          <div className="section-heading"><p className="eyebrow">Keep exploring</p><h2>Other ways to help</h2></div>
          <div className="related-grid">{fallbackRelated.map((relatedItem) => <PackageCard key={relatedItem.id} item={relatedItem} onNavigate={onNavigate} />)}</div>
        </section>
      </div>

      {galleryOpen && (
        <div className="gallery-layer" role="dialog" aria-modal="true" aria-label={`${item.title} photo gallery`}>
          <header><button onClick={() => setGalleryOpen(false)} aria-label="Close photo gallery"><X /></button><strong>{item.title}</strong><span>{item.images.length} photos</span></header>
          <div className="gallery-list">{item.images.map((image) => <img key={image.src} src={image.src} alt={image.alt} />)}</div>
        </div>
      )}
    </main>
  );
}

function BasketDrawer({ basket, total, onClose, onExplore, onQuantity, onCheckout }: { basket: BasketItem[]; total: number; onClose: () => void; onExplore: () => void; onQuantity: (index: number, delta: number) => void; onCheckout: () => void }) {
  const count = basket.reduce((sum, entry) => sum + entry.quantity, 0);
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="basket-drawer" role="dialog" aria-modal="true" aria-labelledby="basket-title">
        <div className="drawer-header"><div><p className="eyebrow">What you have chosen</p><h2 id="basket-title">Your basket</h2></div><button className="icon-button" onClick={onClose} aria-label="Close basket"><X /></button></div>
        {!basket.length ? (
          <div className="empty-basket"><span><ShoppingBag size={28} /></span><h3>Your basket is empty</h3><p>Start with a meal, an hour of your time or another useful gift.</p><button className="primary-button" onClick={onExplore}>See ways to help</button></div>
        ) : (
          <><div className="basket-items">{basket.map((entry, index) => {
            const item = packageById.get(entry.packageId)!;
            return <article className="basket-item" key={`${entry.packageId}-${entry.amount}`}><img src={item.images[0].src} alt="" /><div className="basket-item-copy"><strong>{item.title}</strong><small>{entry.amount ? currency.format(entry.amount) : item.duration}</small></div><div className="quantity-control"><button onClick={() => onQuantity(index, -1)} aria-label={`Remove one ${item.title}`}><Minus size={14} /></button><span>{entry.quantity}</span><button onClick={() => onQuantity(index, 1)} aria-label={`Add one ${item.title}`}><Plus size={14} /></button></div></article>;
          })}</div><div className="basket-summary"><div><span>Your donation total</span><strong>{currency.format(total)}</strong></div><div><span>Items in your basket</span><strong>{count}</strong></div><p><ShieldCheck size={16} /> {total > 0 ? "Pay by M-PESA, then share your confirmation code with TI." : "TI will contact you before arranging an activity."}</p><button className="primary-button full" onClick={onCheckout}>{total > 0 ? "Continue to payment" : "Share my interest"} <ArrowRight size={18} /></button></div></>
        )}
      </aside>
    </div>
  );
}

interface CheckoutProps {
  basket: BasketItem[];
  total: number;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (submission: DonationSubmission) => Promise<void>;
}

function Checkout({ basket, total, onBack, onClose, onSubmit }: CheckoutProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [mpesaReference, setMpesaReference] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const actCount = basket.reduce((count, item) => count + item.quantity, 0);
  const hasMoneyContribution = total > 0;
  const emailInvalid = !isValidEmail(email);
  const nameInvalid = !anonymous && !name.trim();
  const phoneInvalid = hasMoneyContribution && !isValidPhone(phone);
  const mpesaReferenceInvalid = hasMoneyContribution && !isValidMpesaReference(mpesaReference);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError("");
    if (emailInvalid || nameInvalid || phoneInvalid || mpesaReferenceInvalid || sending) return;

    const items = basket.map((entry) => {
      const item = packageById.get(entry.packageId)!;
      return {
        packageId: item.id,
        title: item.title,
        kind: item.kind,
        quantity: entry.quantity,
        unitAmount: entry.amount,
      };
    });

    setSending(true);
    try {
      await onSubmit({
        reference: createSubmissionReference(),
        donor: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          anonymous,
        },
        note: note.trim(),
        mpesaReference: mpesaReference.trim().toUpperCase(),
        items,
        website,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your details did not reach TI. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="checkout-layer" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header className="checkout-header"><button className="checkout-back" onClick={onBack}><ArrowLeft size={18} /> Back to basket</button><span className="checkout-wordmark">Tuokoleane Initiative</span><button className="icon-button" onClick={onClose} aria-label="Close checkout"><X /></button></header>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <p className="eyebrow">{hasMoneyContribution ? "One last step" : "Share your interest"}</p><h1 id="checkout-title">{hasMoneyContribution ? "Tell TI about your payment." : "Tell TI how to reach you."}</h1><p className="checkout-lede">{hasMoneyContribution ? "Pay the total below by M-PESA, then enter your confirmation code so the team can find your payment." : "The TI team will use these details to check the opportunity and talk you through what happens next."}</p>

          {hasMoneyContribution && (
            <section className="checkout-payment-card" aria-labelledby="mpesa-payment-title">
              <div className="checkout-payment-head"><div><p className="eyebrow">Mobile money</p><h2 id="mpesa-payment-title">Pay with M-PESA</h2></div><PaymentBadges /></div>
              <dl>
                <div><dt>Amount</dt><dd>{currency.format(total)}</dd></div>
                <div><dt>Till Number</dt><dd>{TI_PAYMENT_DETAILS.tillNumber}</dd></div>
                <div><dt>Account name</dt><dd>{TI_PAYMENT_DETAILS.accountName}</dd></div>
              </dl>
              <ol>
                <li>Open M-PESA and select Lipa na M-PESA, then Buy Goods and Services.</li>
                <li>Enter Till Number {TI_PAYMENT_DETAILS.tillNumber} and pay {currency.format(total)}.</li>
                <li>Forward the M-PESA confirmation message to <a href={`sms:${TI_PAYMENT_DETAILS.confirmationPhoneLink}`}>{TI_PAYMENT_DETAILS.confirmationPhoneDisplay}</a>.</li>
              </ol>
            </section>
          )}

          <div className="form-row two-columns"><label><span>Name {!anonymous && "*"}</span><input value={name} onChange={(event) => setName(event.target.value)} disabled={anonymous || sending} aria-invalid={submitted && nameInvalid} maxLength={120} placeholder="Your name" /></label><label><span>Email *</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={sending} aria-invalid={submitted && emailInvalid} maxLength={254} autoComplete="email" placeholder="you@example.com" /></label></div>
          <div className="form-row two-columns">
            <label><span>{hasMoneyContribution ? "Phone used for M-PESA *" : "Phone"}</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={sending} aria-invalid={submitted && phoneInvalid} maxLength={30} autoComplete="tel" placeholder="07XX XXX XXX" /></label>
            {hasMoneyContribution && <label><span>M-PESA confirmation code *</span><input value={mpesaReference} onChange={(event) => setMpesaReference(event.target.value.toUpperCase().replace(/\s/g, ""))} disabled={sending} aria-invalid={submitted && mpesaReferenceInvalid} maxLength={20} autoComplete="off" placeholder="For example, TAA1B2C3D4" /></label>}
          </div>
          {submitted && (emailInvalid || nameInvalid || phoneInvalid || mpesaReferenceInvalid) && <p className="form-error">{hasMoneyContribution ? "Check your email, M-PESA phone number and confirmation code. Add your name, or choose to give anonymously." : "Check your email and add your name, or choose to take part anonymously."}</p>}
          <label className="check-row"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} disabled={sending} /><span><strong>{hasMoneyContribution ? "Give anonymously" : "Take part anonymously"}</strong><small>TI still needs your contact details to follow up, but your name will not be shared publicly.</small></span></label>
          <label className="form-row"><span>A note for the team <small>Optional</small></span><textarea value={note} onChange={(event) => setNote(event.target.value)} disabled={sending} maxLength={2000} rows={4} placeholder={hasMoneyContribution ? "Anything Tuokoleane should know about this donation?" : "Tell Tuokoleane about your availability or anything the team should know."} /></label>
          <label className="honeypot" aria-hidden="true"><span>Website</span><input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
          {submitError && <p className="submission-error" role="alert">{submitError}</p>}
          <button className="primary-button checkout-submit" type="submit" disabled={sending}>{sending ? "Sending to TI..." : hasMoneyContribution ? "Send payment details" : "Send my interest"} {!sending && <ArrowRight size={18} />}</button><p className="form-fineprint">{hasMoneyContribution ? "TI checks your M-PESA code against its payment records before confirming the donation." : "TI will contact you before any volunteer activity is confirmed."}</p>
        </form>
        <aside className="order-card"><div className="order-card-head"><p className="eyebrow">What you have chosen</p><span>{actCount} {actCount === 1 ? "item" : "items"}</span></div><div className="order-lines">{basket.map((entry) => {
          const item = packageById.get(entry.packageId)!;
          return <div className="order-line" key={`${entry.packageId}-${entry.amount}`}><img src={item.images[0].src} alt="" /><div><strong>{item.title}{entry.quantity > 1 ? ` × ${entry.quantity}` : ""}</strong><small>{item.program}</small></div><b>{entry.amount ? currency.format(entry.amount * entry.quantity) : "Time"}</b></div>;
        })}</div><div className="order-total"><span>Total donation</span><strong>{currency.format(total)}</strong></div><p className="order-note"><CircleCheck size={17} /> {hasMoneyContribution ? "TI will use these details to find your M-PESA payment." : "TI will email or call you after checking the opportunity."}</p></aside>
      </div>
    </div>
  );
}

function NotFound({ onNavigate }: { onNavigate: (path: string, hash?: string) => void }) {
  return <main className="not-found page-width"><p className="eyebrow">We cannot find this page</p><h1>Let’s get you back to a way you can help.</h1><p>The link may have changed, or this page may no longer be available.</p><button className="primary-button" onClick={() => onNavigate("/", "marketplace")}>See ways to help</button></main>;
}

type SocialPlatform = "instagram" | "facebook";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle className="social-icon-dot" cx="17.5" cy="6.5" r="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 8h3V4h-3c-3.1 0-5 1.9-5 5v3H6v4h3v8h4v-8h3.3l.7-4h-4V9c0-.7.3-1 1-1Z" />
    </svg>
  );
}

function Footer({ onNavigate }: { onNavigate: (path: string, hash?: string) => void }) {
  const homeLink = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => { event.preventDefault(); onNavigate("/", hash); };
  const routeLink = (event: React.MouseEvent<HTMLAnchorElement>, path: string, hash?: string) => { event.preventDefault(); onNavigate(path, hash); };
  return (
    <footer className="site-footer">
      <div className="page-width footer-cta"><div><p className="eyebrow">Start with what you can do today</p><h2>One useful act is enough to begin.</h2></div><button className="primary-button" onClick={() => onNavigate("/", "marketplace")}>Find a way to help <ArrowRight size={18} /></button></div>
      <div className="page-width footer-grid">
        <div className="footer-brand"><BrandLogo variant="symbol" className="footer-symbol" alt="Tuokoleane Initiative symbol" /><p>Tuokoleane brings people together to share practical help, look out for one another and treat every person with dignity.</p><span className="footer-mantra">If you cannot Give, Share.<br />If you cannot Share, Care.<br /><strong>Dare to Care.</strong></span></div>
        <div><strong>Explore</strong><a href="/#marketplace" onClick={(event) => homeLink(event, "marketplace")}>Ways to help</a><a href="/#programs" onClick={(event) => homeLink(event, "programs")}>Programmes</a><a href="/about#values" onClick={(event) => routeLink(event, "/about", "values")}>Our values</a><a href="/gallery" onClick={(event) => routeLink(event, "/gallery")}>Gallery</a></div>
        <div><strong>Take part</strong><a href="/listing/meal" onClick={(event) => { event.preventDefault(); onNavigate("/listing/meal"); }}>Give a meal</a><a href="/listing/school-fees" onClick={(event) => { event.preventDefault(); onNavigate("/listing/school-fees"); }}>Support education</a><a href="/listing/wellness-day" onClick={(event) => { event.preventDefault(); onNavigate("/listing/wellness-day"); }}>Support a wellness day</a></div>
        <div><strong>Learn</strong><a href="/program/sharesphere" onClick={(event) => { event.preventDefault(); onNavigate("/program/sharesphere"); }}>ShareSphere</a><a href="/program/family-units" onClick={(event) => { event.preventDefault(); onNavigate("/program/family-units"); }}>Family Units</a><a href="https://tuokoleane.org">Visit Tuokoleane.org</a></div>
        <div className="footer-contact">
          <strong>Contact</strong>
          <a href="mailto:tuokoleaneinitiative@gmail.com">tuokoleaneinitiative@gmail.com</a>
          <a href="tel:+254740603626">+254 740 603 626</a>
          <div className="footer-social-links">
            <a href="https://www.instagram.com/tuokoleaneinitiative/" target="_blank" rel="noreferrer" aria-label="Tuokoleane Initiative on Instagram" title="Instagram"><SocialIcon platform="instagram" /></a>
            <a href="https://www.facebook.com/profile.php?id=100077672700363" target="_blank" rel="noreferrer" aria-label="Tuokoleane Initiative on Facebook" title="Facebook"><SocialIcon platform="facebook" /></a>
          </div>
        </div>
      </div>
      <section className="page-width footer-payments" aria-labelledby="footer-payments-title">
        <h2 id="footer-payments-title">We Support Donations Made Through</h2>
        <div className="footer-payment-badges">
          <img className="payment-badge-wide" src="/images/payment-badges/mpesa.svg" alt="M-PESA" loading="lazy" decoding="async" />
          <img src="/images/payment-badges/tkash.jpg" alt="T-Kash" loading="lazy" decoding="async" />
          <img src="/images/payment-badges/airtel-money.png" alt="Airtel Money" loading="lazy" decoding="async" />
        </div>
      </section>
      <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} Tuokoleane Initiative</span></div>
    </footer>
  );
}

export default App;
