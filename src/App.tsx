import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock3,
  Heart,
  Images,
  Menu,
  Minus,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { categories, kindnessPackages, programs, type KindnessPackage, type Program } from "./data";

interface BasketItem {
  packageId: string;
  quantity: number;
  amount: number;
}

interface Confirmation {
  reference: string;
  email: string;
  itemCount: number;
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
  21, 22, 24, 27, 28, 36, 42, 43, 49, 50, 55, 56, 61, 63, 66, 67, 70, 71, 73,
]);

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
  if (item.kind === "custom") return `From ${currency.format(item.minimumAmount ?? 500)}`;
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

function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [basket, setBasket] = useState<BasketItem[]>(readBasket);
  const [basketOpen, setBasketOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const routePackage = path.startsWith("/listing/")
    ? packageById.get(decodeURIComponent(path.slice("/listing/".length)))
    : undefined;
  const routeProgram = path.startsWith("/program/")
    ? programById.get(decodeURIComponent(path.slice("/program/".length)))
    : undefined;

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
    document.title = routePackage
      ? `${routePackage.title} | Tuokoleane Initiative`
      : routeProgram
        ? `${routeProgram.name} | Tuokoleane Initiative`
        : "Catalogue of Kindness | Tuokoleane Initiative";
  }, [routePackage, routeProgram]);

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
    const unitAmount = item.kind === "fixed" ? item.price ?? 0 : item.kind === "custom" ? amount ?? 0 : 0;
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

  const finishPledge = (email: string) => {
    setCheckoutOpen(false);
    setConfirmation({
      reference: `TI-${Date.now().toString().slice(-6)}`,
      email,
      itemCount: basketCount,
    });
    setBasket([]);
  };

  const isListingRoute = path.startsWith("/listing/");
  const isProgramRoute = path.startsWith("/program/");

  return (
    <div className="app-shell">
      <Header
        basketCount={basketCount}
        expanded={!isListingRoute && !isProgramRoute}
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
      ) : (
        <HomePage onNavigate={navigate} />
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
          onSubmit={finishPledge}
        />
      )}

      {confirmation && (
        <div className="modal-backdrop confirmation-backdrop" role="presentation">
          <section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <span className="success-icon"><Check size={32} /></span>
            <p className="eyebrow">Demo pledge created</p>
            <h2 id="confirmation-title">Your kindness plan is ready.</h2>
            <p>
              Reference <strong>{confirmation.reference}</strong> covers {confirmation.itemCount} {confirmation.itemCount === 1 ? "act" : "acts"}. No money was charged and no email was sent to {confirmation.email}.
            </p>
            <div className="confirmation-next"><strong>What production adds next</strong><span>Secure payment, verified allocation and real fulfilment updates.</span></div>
            <button className="primary-button full" onClick={() => setConfirmation(null)}>Back to the marketplace</button>
          </section>
        </div>
      )}
    </div>
  );
}

interface HeaderProps {
  basketCount: number;
  expanded: boolean;
  menuOpen: boolean;
  onBasket: () => void;
  onMenu: () => void;
  onNavigate: (path: string, hash?: string) => void;
}

function Brand({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }} aria-label="Tuokoleane Initiative home">
      <span className="brand-logo-crop" aria-hidden="true"><img src="/images/brand/tuokoleane-logo-blue.png" alt="" /></span>
    </a>
  );
}

const headerDestinations = [
  { label: "Give", hash: "marketplace", image: "/images/listings/meal/02.jpg" },
  { label: "About TI", hash: "values", image: "/images/ti-gallery/ti-gallery-51.jpg" },
  { label: "Gallery", hash: "gallery", image: "/images/ti-gallery/ti-gallery-75.jpg" },
  { label: "How it works", hash: "how-it-works", image: "/images/listings/mentor/02.jpg" },
];

function Header({ basketCount, expanded, menuOpen, onBasket, onMenu, onNavigate }: HeaderProps) {
  const homeLink = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    event.preventDefault();
    onNavigate("/", hash);
  };

  return (
    <header className={`site-header${expanded ? " site-header-expanded" : ""}`}>
      <div className="header-main">
        <Brand onNavigate={onNavigate} />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {headerDestinations.map((destination, index) => (
            <a
              className={index === 0 ? "nav-destination nav-destination-active" : "nav-destination"}
              href={`/#${destination.hash}`}
              key={destination.label}
              onClick={(event) => homeLink(event, destination.hash)}
            >
              <span className="nav-destination-image" aria-hidden="true">
                <img src={destination.image} alt="" />
              </span>
              <span>{destination.label}</span>
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="basket-button" onClick={onBasket} aria-label={`Open kindness basket with ${basketCount} items`}>
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
          <a href="/#marketplace" onClick={(event) => homeLink(event, "marketplace")}>
            <strong>What can I do?</strong>
            <span>Browse practical acts</span>
          </a>
          <a href="/#how-it-works" onClick={(event) => homeLink(event, "how-it-works")}>
            <strong>How does it work?</strong>
            <span>See the path from pledge to action</span>
          </a>
          <a href="/#programs" onClick={(event) => homeLink(event, "programs")}>
            <strong>Who makes it happen?</strong>
            <span>Meet the TI programs</span>
          </a>
          <a className="discovery-search" href="/#marketplace" onClick={(event) => homeLink(event, "marketplace")} aria-label="Browse all ways to help">
            <Search size={22} strokeWidth={2.4} />
          </a>
        </nav>
      )}
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {headerDestinations.map((destination) => (
            <a href={`/#${destination.hash}`} key={destination.label} onClick={(event) => homeLink(event, destination.hash)}>
              <span className="nav-destination-image" aria-hidden="true"><img src={destination.image} alt="" /></span>
              <span>{destination.label}</span>
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function HomePage({ onNavigate }: { onNavigate: (path: string, hash?: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<CampaignIdea | null>(null);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [activeGalleryCollection, setActiveGalleryCollection] = useState<GalleryCollection>("All Photos");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

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

  useEffect(() => {
    if (!selectedIdea && selectedGalleryIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIdea(null);
        setSelectedGalleryIndex(null);
      }

      if (selectedGalleryIndex === null) return;
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
  }, [selectedIdea, selectedGalleryIndex]);

  const browseFromIdea = () => {
    setSelectedIdea(null);
    window.requestAnimationFrame(() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" }));
  };

  const filteredGalleryPhotos = activeGalleryCollection === "All Photos"
    ? galleryPhotos
    : galleryPhotos.filter((photo) => photo.collection === activeGalleryCollection);
  const visibleGalleryPhotos = galleryExpanded ? filteredGalleryPhotos : filteredGalleryPhotos.slice(0, 18);
  const selectedGalleryPhoto = selectedGalleryIndex === null ? null : galleryPhotos[selectedGalleryIndex];

  const showPreviousGalleryPhoto = () => {
    setSelectedGalleryIndex((current) => current === null ? null : (current - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const showNextGalleryPhoto = () => {
    setSelectedGalleryIndex((current) => current === null ? null : (current + 1) % galleryPhotos.length);
  };

  return (
    <main id="top">
      <section className="home-hero" aria-label="Tuokoleane Catalogue of Kindness">
        <img className="home-hero-image" src="/images/listings/meal/02.jpg" alt="Representative scene of a family sharing a meal" />
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="home-hero-copy page-width">
          <h1>What if touching a life was as easy as shopping online?</h1>
          <p className="hero-lede">Welcome to the Amazon of Charity. A place where anyone, anywhere, can find a way to Give. Share. Care.</p>
          <button className="primary-button hero-primary" onClick={() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" })}>
            Browse ways to help <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="reach-section" aria-labelledby="reach-title">
        <div className="page-width reach-heading">
          <p className="eyebrow">A growing family</p>
          <h2 id="reach-title">Touching lives across campuses and counties.</h2>
        </div>
        <div className="reach-marquee" role="region" aria-label="Places and communities reached">
          <div className="reach-track">
            {[0, 1].map((set) => (
              <div className="reach-set" key={set} aria-hidden={set === 1}>
                {placesReached.map((place) => (
                  <span className="reach-mark" key={`${set}-${place.name}`}>
                    <img className="reach-logo" src={place.logo} alt={`${place.name} official logo`} />
                    <span>{place.name}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="values-section" id="values">
        <div className="page-width values-heading">
          <h2><span>Dignity over display.</span><span>Clarity over vague promises.</span><span>Belonging over pity.</span></h2>
        </div>
        <div className="page-width values-infographic">
          <article className="value-card value-card-primary">
            <span className="value-number">01</span>
            <div className="value-orbits" aria-hidden="true"><i /><i /><i /><Heart fill="currentColor" /></div>
            <div><p>Our first value</p><h3>Dignity</h3><span>People are participants in their own lives, not material for a campaign.</span></div>
          </article>
          <article className="value-card">
            <span className="value-number">02</span>
            <div className="value-line" aria-hidden="true"><i /><i /><i /></div>
            <div><p>Make the path visible</p><h3>Clarity</h3><span>Say what the pledge includes, who coordinates it and what still needs confirmation.</span></div>
          </article>
          <article className="value-card">
            <span className="value-number">03</span>
            <div className="value-people" aria-hidden="true"><i /><i /><i /></div>
            <div><p>One big family</p><h3>Belonging</h3><span>Give with people, not at them. Care works best when everyone has agency.</span></div>
          </article>
        </div>
        <div className="page-width model-stats" aria-label="Catalogue overview">
          <div><strong>12</strong><span>practical ways to help</span></div>
          <div><strong>3</strong><span>ways to give: money, time or goods</span></div>
          <div><strong>{currency.format(500)}</strong><span>starting contribution</span></div>
        </div>
      </section>

      <section className="marketplace page-width" id="marketplace">
        <div className="section-heading">
          <h2>What do you have to give?</h2>
        </div>
        <div className="marketplace-toolbar">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Search kindness packages</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, school, trees…" />
          </label>
          <div className="category-tabs" aria-label="Filter by category">
            {categories.map((category) => (
              <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
        </div>
        {filteredPackages.length ? (
          <div className="package-grid">
            {filteredPackages.map((item) => <PackageCard key={item.id} item={item} onNavigate={onNavigate} />)}
          </div>
        ) : (
          <div className="empty-results">
            <Search size={26} />
            <h3>No packages found</h3>
            <p>Try another word or clear the current filter.</p>
            <button onClick={() => { setQuery(""); setActiveCategory("All"); }}>Show everything</button>
          </div>
        )}
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-width how-grid">
          <div>
            <p className="eyebrow">A clearer path from intention to action</p>
            <h2>Know what happens next.</h2>
          </div>
          <ol className="steps-list">
            <li><span>1</span><div><strong>Choose an act</strong><p>Open a listing and read exactly what you are offering.</p></div></li>
            <li><span>2</span><div><strong>Tuokoleane coordinates it</strong><p>The local team matches the contribution to an activity or verified need.</p></div></li>
            <li><span>3</span><div><strong>Follow the outcome</strong><p>When fulfilment evidence is available, you receive a practical update.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="programs page-width" id="programs">
        <div className="section-heading compact-heading">
          <p className="eyebrow">The work behind the listings</p>
          <h2>One initiative. Several ways to belong.</h2>
        </div>
        <div className="program-grid">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} onNavigate={onNavigate} />
          ))}
        </div>
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
          <p className="campaign-note">The people shown are concept artwork, not photographed beneficiaries or documented Tuokoleane activities.</p>
        </div>
      </section>

      <section className="manifesto-section">
        <div className="page-width manifesto-grid">
          <div><p className="eyebrow">The Tuokoleane way</p><h2>Do good without needing applause.</h2></div>
          <div><p>Help without turning someone’s life into a performance. Make the promise clear. Let the person receiving care keep their privacy, choices and voice.</p><button className="primary-button manifesto-button" onClick={() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" })}>Choose one useful act <ArrowRight size={18} /></button></div>
        </div>
      </section>

      <section id="gallery" className="ti-gallery-section" aria-labelledby="ti-gallery-title">
        <div className="page-width">
          <div className="ti-gallery-heading">
            <div>
              <p className="eyebrow"><Images size={15} /> Real moments. One big family.</p>
              <h2 id="ti-gallery-title">Tuokoleane Initiative Gallery</h2>
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

          {filteredGalleryPhotos.length > 18 && (
            <div className="ti-gallery-more">
              <button className="secondary-button" onClick={() => setGalleryExpanded((expanded) => !expanded)}>
                <Images size={18} /> {galleryExpanded ? "Show fewer photos" : `View all ${filteredGalleryPhotos.length} photos`}
              </button>
            </div>
          )}
        </div>
      </section>

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
              <p className="campaign-dialog-note">This catalogue is a prototype. No payment, placement or fulfilled act is created.</p>
            </div>
          </section>
        </div>
      )}

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
    <article className="program-card" style={{ "--program-accent": program.accent } as React.CSSProperties}>
      <a className="program-card-photo" href={path} onClick={open} aria-label={`Explore ${program.name}`}>
        <img src={program.image} alt={program.imageAlt} />
        <span>{program.imageSource === "archive" ? "Tuokoleane archive" : "Programme concept"}</span>
      </a>
      <div className="program-card-body">
        <div className="program-card-number">{program.number}</div>
        <p>{program.kicker}</p>
        <h3><a href={path} onClick={open}>{program.name}</a></h3>
        <p className="program-card-summary">{program.summary}</p>
        <div className="program-tags" aria-label={`${program.name} activities`}>
          {program.activities.slice(0, 2).map((activity) => <span key={activity}>{activity}</span>)}
        </div>
        <a className="program-card-link" href={path} onClick={open}>Explore initiative <ChevronRight size={17} /></a>
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
        <button className="back-link" onClick={() => onNavigate("/", "programs")}><ArrowLeft size={18} /> All initiatives</button>
        <section className="program-hero">
          <div className="program-hero-copy">
            <p className="eyebrow">{program.number} · {program.kicker}</p>
            <h1>{program.name}</h1>
            <p>{program.summary}</p>
          </div>
          <figure className="program-hero-media">
            <img src={program.image} alt={program.imageAlt} />
            <figcaption>{program.imageSource === "archive" ? "Real Tuokoleane programme photography · April 2025" : "Representative programme imagery · not a record of a completed activity"}</figcaption>
          </figure>
        </section>

        <section className="program-overview">
          <p className="eyebrow">What this initiative is for</p>
          <p>{program.overview}</p>
        </section>

        <section className="program-detail-grid" aria-label={`${program.name} details`}>
          <article><span>01</span><h2>What happens here</h2><ul>{program.activities.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>
          <article><span>02</span><h2>What it is designed to build</h2><ul>{program.intendedOutcomes.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>
          <article><span>03</span><h2>How progress can be understood</h2><ul>{program.measurements.map((entry) => <li key={entry}>{entry}</li>)}</ul></article>
        </section>

        <section className="program-related">
          <div className="section-heading">
            <p className="eyebrow">Take part in this work</p>
            <h2>Practical ways in.</h2>
            <p>These listings turn the programme idea into a clear contribution or expression of interest.</p>
          </div>
          <div className="related-grid">{relatedPackages.map((item) => <PackageCard key={item.id} item={item} onNavigate={onNavigate} />)}</div>
        </section>

        <section className="program-scope">
          <ShieldCheck size={22} />
          <div><strong>Clear about the boundary</strong><p>The programme descriptions reflect Tuokoleane’s supplied concept document. Intended outcomes are goals, not claims of measured impact. Payment and volunteer placement remain disabled in this prototype.</p></div>
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
    <article className="package-card">
      <a className="package-photo-link" href={path} onClick={open} aria-label={`View ${item.title}`}>
        <img src={item.images[0].src} alt={item.images[0].alt} />
        <span>{item.label}</span>
      </a>
      <div className="package-body">
        <div className="package-title-row">
          <a href={path} onClick={open}><h3>{item.title}</h3></a>
          <strong>{packagePrice(item)}</strong>
        </div>
        <p>{item.shortDescription}</p>
        <div className="package-meta"><span>{item.program}</span><span><Clock3 size={14} /> {item.duration}</span></div>
      </div>
    </article>
  );
}

function ListingPage({ item, onAdd, onNavigate }: { item: KindnessPackage; onAdd: (item: KindnessPackage, amount?: number) => void; onNavigate: (path: string, hash?: string) => void }) {
  const [customAmount, setCustomAmount] = useState("1000");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    setCustomAmount("1000");
    setGalleryOpen(false);
    setSaved(false);
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

  const amount = item.kind === "custom" ? Number(customAmount) || 0 : item.price ?? 0;
  const minimumAmount = item.minimumAmount ?? 500;
  const related = kindnessPackages.filter((candidate) => candidate.id !== item.id && candidate.category === item.category).slice(0, 3);
  const fallbackRelated = related.length >= 3 ? related : [...related, ...kindnessPackages.filter((candidate) => candidate.id !== item.id && !related.includes(candidate))].slice(0, 3);

  return (
    <main className="listing-page">
      <div className="listing-shell page-width">
        <div className="listing-topline">
          <button className="back-link" onClick={() => onNavigate("/", "marketplace")}><ArrowLeft size={18} /> All ways to help</button>
          <div className="listing-actions">
            <button onClick={share}><Share2 size={17} /> {shareLabel}</button>
            <button onClick={() => setSaved((value) => !value)} aria-pressed={saved}><Heart size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button>
          </div>
        </div>
        <div className="listing-heading">
          <p className="eyebrow">{item.program}</p>
          <h1>{item.title}</h1>
          <p>{item.shortDescription}</p>
        </div>

        <div className="photo-grid">
          {item.images.map((image, index) => (
            <button key={image.src} className={`photo-tile photo-${index + 1}`} onClick={() => setGalleryOpen(true)} aria-label={`Open photo ${index + 1} of ${item.images.length}`}>
              <img src={image.src} alt={image.alt} />
            </button>
          ))}
          <button className="show-photos" onClick={() => setGalleryOpen(true)}><Images size={17} /> Show all photos</button>
        </div>
        <p className="photo-disclosure">Representative imagery created for this prototype. These are not photographs of named beneficiaries or completed Tuokoleane activities.</p>

        <div className="listing-content-grid">
          <div className="listing-content">
            <section className="listing-intro">
              <div>
                <h2>{item.label} · {item.category}</h2>
                <p>Coordinated in Kenya by Tuokoleane Initiative</p>
              </div>
              <span className="coordinator-mark" aria-label="Tuokoleane coordinated"><img src="/images/brand/tuokoleane-logo-blue.png" alt="" /></span>
            </section>

            <section className="listing-highlights" aria-label="Listing highlights">
              <div><CheckCircle2 /><span><strong>Clear starting point</strong><small>{item.suitableFor}</small></span></div>
              <div><Users /><span><strong>Locally coordinated</strong><small>{item.coordination}</small></span></div>
              <div><ShieldCheck /><span><strong>Boundaries first</strong><small>No recipient or outcome is promised before the TI team confirms it.</small></span></div>
            </section>

            <section className="listing-section">
              <h2>About this act of kindness</h2>
              <p>{item.description}</p>
            </section>

            <section className="listing-section">
              <h2>What your pledge includes</h2>
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
                <li><span>1</span><div><strong>You create a pledge</strong><p>This prototype records the intent in your browser only.</p></div></li>
                <li><span>2</span><div><strong>TI confirms the opportunity</strong><p>In production, the team would check the need, timing and practical conditions.</p></div></li>
                <li><span>3</span><div><strong>You receive an update</strong><p>When evidence is available, TI can report what was allocated and what happened.</p></div></li>
              </ol>
            </section>
          </div>

          <aside className="pledge-card" aria-label="Create a pledge">
            <div className="pledge-price"><strong>{item.kind === "custom" ? "Choose your amount" : packagePrice(item)}</strong><span>{item.kind === "time" ? item.duration : "per pledge"}</span></div>
            {item.kind === "custom" && (
              <label className="amount-field">
                <span>Your contribution</span>
                <div><b>KSh</b><input inputMode="numeric" value={customAmount} onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ""))} aria-label="Contribution amount in Kenyan shillings" /></div>
              </label>
            )}
            <div className="pledge-summary"><span>Programme</span><strong>{item.program}</strong><span>Commitment</span><strong>{item.kind === "time" ? item.duration : amount ? currency.format(amount) : "Choose amount"}</strong></div>
            <button className="primary-button full" disabled={item.kind === "custom" && amount < minimumAmount} onClick={() => onAdd(item, amount)}>
              {item.kind === "time" ? "Add to my plan" : "Add to basket"}
            </button>
            {item.kind === "custom" && amount < minimumAmount && <p className="field-error">Enter at least {currency.format(minimumAmount)} for this demo.</p>}
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
        <div className="drawer-header"><div><p className="eyebrow">Your plan</p><h2 id="basket-title">Kindness basket</h2></div><button className="icon-button" onClick={onClose} aria-label="Close basket"><X /></button></div>
        {!basket.length ? (
          <div className="empty-basket"><span><ShoppingBag size={28} /></span><h3>Your basket is empty</h3><p>Start with one meal, one hour or one useful contribution.</p><button className="primary-button" onClick={onExplore}>Explore listings</button></div>
        ) : (
          <><div className="basket-items">{basket.map((entry, index) => {
            const item = packageById.get(entry.packageId)!;
            return <article className="basket-item" key={`${entry.packageId}-${entry.amount}`}><img src={item.images[0].src} alt="" /><div className="basket-item-copy"><strong>{item.title}</strong><small>{entry.amount ? currency.format(entry.amount) : item.duration}</small></div><div className="quantity-control"><button onClick={() => onQuantity(index, -1)} aria-label={`Remove one ${item.title}`}><Minus size={14} /></button><span>{entry.quantity}</span><button onClick={() => onQuantity(index, 1)} aria-label={`Add one ${item.title}`}><Plus size={14} /></button></div></article>;
          })}</div><div className="basket-summary"><div><span>Money contributions</span><strong>{currency.format(total)}</strong></div><div><span>Acts in this plan</span><strong>{count}</strong></div><p><ShieldCheck size={16} /> Demo only. Nothing will be charged.</p><button className="primary-button full" onClick={onCheckout}>Review pledge <ArrowRight size={18} /></button></div></>
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
  onSubmit: (email: string) => void;
}

function Checkout({ basket, total, onBack, onClose, onSubmit }: CheckoutProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const actCount = basket.reduce((count, item) => count + item.quantity, 0);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!email.trim() || (!anonymous && !name.trim())) return;
    onSubmit(email.trim());
  };

  return (
    <div className="checkout-layer" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header className="checkout-header"><button className="checkout-back" onClick={onBack}><ArrowLeft size={18} /> Back to basket</button><span className="checkout-wordmark">Tuokoleane Initiative</span><button className="icon-button" onClick={onClose} aria-label="Close checkout"><X /></button></header>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <p className="eyebrow">Review your pledge</p><h1 id="checkout-title">Who is this kindness from?</h1><p className="checkout-lede">We only need enough information to show the flow. This preview saves nothing beyond your browser.</p>
          <div className="form-row two-columns"><label><span>Name {!anonymous && "*"}</span><input value={name} onChange={(event) => setName(event.target.value)} disabled={anonymous} aria-invalid={submitted && !anonymous && !name.trim()} placeholder="Your name" /></label><label><span>Email *</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={submitted && !email.trim()} placeholder="you@example.com" /></label></div>
          {submitted && (!email.trim() || (!anonymous && !name.trim())) && <p className="form-error">Add your email and either your name or choose to give anonymously.</p>}
          <label className="check-row"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /><span><strong>Give anonymously</strong><small>Your name would not appear in public donor recognition.</small></span></label>
          <label className="form-row"><span>A note for the team <small>Optional</small></span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Anything Tuokoleane should know about this pledge?" /></label>
          <div className="demo-payment"><ShieldCheck size={21} /><span><strong>Payment is intentionally off</strong><small>M-Pesa and card checkout will be connected only after the receiving account, safeguarding rules and refund process are confirmed.</small></span></div>
          <button className="primary-button checkout-submit" type="submit">Create demo pledge <ArrowRight size={18} /></button><p className="form-fineprint">No donation, receipt or volunteer placement is created.</p>
        </form>
        <aside className="order-card"><div className="order-card-head"><p className="eyebrow">Your kindness plan</p><span>{actCount} {actCount === 1 ? "act" : "acts"}</span></div><div className="order-lines">{basket.map((entry) => {
          const item = packageById.get(entry.packageId)!;
          return <div className="order-line" key={`${entry.packageId}-${entry.amount}`}><img src={item.images[0].src} alt="" /><div><strong>{item.title}{entry.quantity > 1 ? ` × ${entry.quantity}` : ""}</strong><small>{item.program}</small></div><b>{entry.amount ? currency.format(entry.amount * entry.quantity) : "Time"}</b></div>;
        })}</div><div className="order-total"><span>Total contribution</span><strong>{currency.format(total)}</strong></div><p className="order-note"><CircleCheck size={17} /> You will see a confirmation before leaving this demo.</p></aside>
      </div>
    </div>
  );
}

function NotFound({ onNavigate }: { onNavigate: (path: string, hash?: string) => void }) {
  return <main className="not-found page-width"><p className="eyebrow">Page not found</p><h1>This part of the catalogue is not available.</h1><p>The link may have changed, or the page may no longer be in this preview.</p><button className="primary-button" onClick={() => onNavigate("/", "marketplace")}>Browse the catalogue</button></main>;
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
  return (
    <footer className="site-footer">
      <div className="page-width footer-cta"><div><p className="eyebrow">Start somewhere useful</p><h2>One act is enough to begin.</h2></div><button className="primary-button" onClick={() => onNavigate("/", "marketplace")}>Explore the catalogue <ArrowRight size={18} /></button></div>
      <div className="page-width footer-grid">
        <div className="footer-brand"><img className="footer-symbol" src="/icons/android-chrome-192x192.png" alt="Tuokoleane Initiative symbol" /><p>Tuokoleane Initiative brings people together around practical care, shared responsibility and the belief that everyone should be treated with dignity.</p><span>Kenya · Give · Share · Care</span></div>
        <div><strong>Explore</strong><a href="/#marketplace" onClick={(event) => homeLink(event, "marketplace")}>Ways to help</a><a href="/#programs" onClick={(event) => homeLink(event, "programs")}>Programs</a><a href="/#values" onClick={(event) => homeLink(event, "values")}>Our values</a></div>
        <div><strong>Take part</strong><a href="/listing/meal" onClick={(event) => { event.preventDefault(); onNavigate("/listing/meal"); }}>Give a meal</a><a href="/listing/school-fees" onClick={(event) => { event.preventDefault(); onNavigate("/listing/school-fees"); }}>Support education</a><a href="/listing/wellness-day" onClick={(event) => { event.preventDefault(); onNavigate("/listing/wellness-day"); }}>Back a wellness day</a></div>
        <div><strong>Learn</strong><a href="/program/sharesphere" onClick={(event) => { event.preventDefault(); onNavigate("/program/sharesphere"); }}>ShareSphere</a><a href="/program/family-units" onClick={(event) => { event.preventDefault(); onNavigate("/program/family-units"); }}>Family Units</a><a href="https://tuokoleane.org">Main website</a></div>
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
      <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} Tuokoleane Initiative</span><span>Prototype marketplace · Archive and representative imagery · No payments</span></div>
    </footer>
  );
}

export default App;
