import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Apple,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { categories, kindnessPackages, programs, type KindnessPackage } from "./data";

interface BasketItem {
  package: KindnessPackage;
  quantity: number;
  amount: number;
}

interface Confirmation {
  reference: string;
  email: string;
  itemCount: number;
}

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function packagePrice(item: KindnessPackage) {
  if (item.kind === "fixed") return currency.format(item.price ?? 0);
  if (item.kind === "custom") return "Choose amount";
  return "Give your time";
}

function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<KindnessPackage | null>(null);
  const [customAmount, setCustomAmount] = useState("1000");
  const [basketOpen, setBasketOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>(() => {
    try {
      const stored = window.localStorage.getItem("ti-kindness-basket");
      return stored ? (JSON.parse(stored) as BasketItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem("ti-kindness-basket", JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    const modalOpen = Boolean(selected) || basketOpen || checkoutOpen || Boolean(confirmation);
    document.body.style.overflow = modalOpen ? "hidden" : "";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected) setSelected(null);
      else if (basketOpen) setBasketOpen(false);
      else if (checkoutOpen) setCheckoutOpen(false);
      else if (confirmation) setConfirmation(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected, basketOpen, checkoutOpen, confirmation]);

  const filteredPackages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return kindnessPackages.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.shortDescription, item.category, item.program]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const basketCount = basket.reduce((total, item) => total + item.quantity, 0);
  const basketTotal = basket.reduce((total, item) => total + item.amount * item.quantity, 0);

  const addToBasket = (item: KindnessPackage, amount?: number) => {
    const unitAmount = item.kind === "fixed" ? item.price ?? 0 : item.kind === "custom" ? amount ?? 0 : 0;
    setBasket((current) => {
      const exactMatch = current.find(
        (entry) => entry.package.id === item.id && entry.amount === unitAmount,
      );
      if (exactMatch) {
        return current.map((entry) =>
          entry === exactMatch ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }
      return [...current, { package: item, quantity: 1, amount: unitAmount }];
    });
    setSelected(null);
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

  const openCheckout = () => {
    setBasketOpen(false);
    setCheckoutOpen(true);
  };

  const finishPledge = (email: string) => {
    const reference = `TI-${Date.now().toString().slice(-6)}`;
    setCheckoutOpen(false);
    setConfirmation({ reference, email, itemCount: basketCount });
    setBasket([]);
  };

  const scrollToMarketplace = () => {
    document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Tuokoleane Initiative home">
          <span className="brand-mark" aria-hidden="true">TI</span>
          <span className="brand-copy">
            <strong>Tuokoleane</strong>
            <small>Initiative</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#marketplace">Kindness marketplace</a>
          <a href="#programs">Programs</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About TI</a>
        </nav>

        <div className="header-actions">
          <button className="basket-button" onClick={() => setBasketOpen(true)} aria-label={`Open kindness basket with ${basketCount} items`}>
            <ShoppingBag size={18} aria-hidden="true" />
            <span>Basket</span>
            {basketCount > 0 && <b>{basketCount}</b>}
          </button>
          <button className="menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation">
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#marketplace" onClick={() => setMobileMenuOpen(false)}>Marketplace</a>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)}>Programs</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About TI</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={15} aria-hidden="true" /> The catalogue of kindness</p>
            <h1>Helping someone should feel this easy.</h1>
            <p className="hero-lede">
              Choose a practical act of kindness. Give money, time, knowledge or something useful. Tuokoleane turns good intentions into a plan.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={scrollToMarketplace}>
                Find a way to help <ArrowRight size={18} aria-hidden="true" />
              </button>
              <a className="text-link" href="#how-it-works">See how it works <ChevronRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="hero-footnote">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>This preview creates demo pledges only. No payment is collected.</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Examples of kindness packages">
            <div className="sun-disc" aria-hidden="true" />
            <article className="floating-card floating-main">
              <span className="mini-icon coral"><Apple size={24} /></span>
              <div><small>Today’s small act</small><strong>Buy a meal</strong></div>
              <b>{currency.format(100)}</b>
            </article>
            <article className="floating-card floating-top">
              <CircleCheck size={19} />
              <div><small>Kindness plan</small><strong>1 act ready</strong></div>
            </article>
            <article className="floating-card floating-bottom">
              <span className="people-stack" aria-hidden="true"><i>Y</i><i>T</i><i>I</i></span>
              <div><small>One big family</small><strong>Give • Share • Care</strong></div>
            </article>
            <div className="hero-message">
              <Heart fill="currentColor" size={18} aria-hidden="true" />
              <span>No charity drive needed.<br /><strong>Start with one useful thing.</strong></span>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Marketplace highlights">
          <span>Based in Kenya</span>
          <i aria-hidden="true" />
          <span>Give money, time or goods</span>
          <i aria-hidden="true" />
          <span>Packages from {currency.format(100)}</span>
          <i aria-hidden="true" />
          <span>Built for clear follow-through</span>
        </section>

        <section className="marketplace section-pad" id="marketplace">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Opportunities today</p>
              <h2>What do you have to give?</h2>
            </div>
            <p>Pick one useful action. Add more if you want. The point is to start.</p>
          </div>

          <div className="marketplace-toolbar">
            <label className="search-field">
              <Search size={19} aria-hidden="true" />
              <span className="sr-only">Search kindness packages</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search meals, school, trees…"
              />
            </label>
            <div className="category-tabs" role="list" aria-label="Filter by category">
              {categories.map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredPackages.length > 0 ? (
            <div className="package-grid">
              {filteredPackages.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="package-card" key={item.id}>
                    <button className={`package-art ${item.accent}`} onClick={() => setSelected(item)} aria-label={`View ${item.title}`}>
                      <span className="package-label">{item.label}</span>
                      <Icon size={58} strokeWidth={1.45} aria-hidden="true" />
                      <span className="art-orbit" aria-hidden="true" />
                    </button>
                    <div className="package-body">
                      <p className="package-program">{item.program}</p>
                      <h3>{item.title}</h3>
                      <p>{item.shortDescription}</p>
                      <div className="package-meta">
                        <strong>{packagePrice(item)}</strong>
                        <span><Clock3 size={14} aria-hidden="true" /> {item.duration}</span>
                      </div>
                      <button className="card-button" onClick={() => setSelected(item)}>
                        {item.kind === "time" ? "See how to help" : item.kind === "custom" ? "Choose amount" : "Add to basket"}
                        <ArrowRight size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={28} aria-hidden="true" />
              <h3>No packages found</h3>
              <p>Try another word or clear the current filter.</p>
              <button onClick={() => { setQuery(""); setActiveCategory("All"); }}>Show everything</button>
            </div>
          )}
        </section>

        <section className="how-section section-pad" id="how-it-works">
          <div className="how-intro">
            <p className="eyebrow light">The model we’re building</p>
            <h2>Kindness is only useful when it reaches someone.</h2>
            <p>
              The production marketplace should make the full path visible: what was promised, how it was allocated and what happened next.
            </p>
            <a href="#marketplace" className="light-link">Choose your first act <ArrowRight size={17} /></a>
          </div>
          <ol className="steps-list">
            <li><span>1</span><div><strong>Choose an act</strong><p>Pick a clear package, offer your time or choose a contribution amount.</p></div></li>
            <li><span>2</span><div><strong>Tuokoleane coordinates it</strong><p>The local team matches the contribution to a real activity or verified need.</p></div></li>
            <li><span>3</span><div><strong>Follow the outcome</strong><p>When fulfilment evidence is available, the donor receives a practical update.</p></div></li>
          </ol>
        </section>

        <section className="programs section-pad" id="programs">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">The work behind the catalogue</p>
              <h2>One initiative. Many ways to belong.</h2>
            </div>
            <p>Packages connect to Tuokoleane programs built around giving, sharing and caring.</p>
          </div>
          <div className="program-list">
            {programs.map((program) => (
              <article className="program-row" key={program.name}>
                <span className={`program-number ${program.tone}`}>{program.number}</span>
                <h3>{program.name}</h3>
                <p>{program.summary}</p>
                <a href="#marketplace" aria-label={`Explore packages related to ${program.name}`}><ArrowRight size={19} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="manifesto section-pad" id="about">
          <div className="manifesto-card">
            <div className="manifesto-copy">
              <p className="eyebrow light">The Tuokoleane way</p>
              <blockquote>“Do good without needing applause.”</blockquote>
              <p>
                Help without needing recognition. Make someone’s day without needing them to know your name. Small acts count when they are real.
              </p>
              <button className="cream-button" onClick={scrollToMarketplace}>Become an Angel <ArrowRight size={18} /></button>
            </div>
            <div className="manifesto-shape" aria-hidden="true">
              <span>Give</span><span>Share</span><span>Care</span>
              <Heart fill="currentColor" />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark inverse" aria-hidden="true">TI</span>
          <div><strong>Tuokoleane Initiative</strong><p>Making the world one big family.</p></div>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="#marketplace">Kindness marketplace</a><a href="#programs">Programs</a></div>
          <div><strong>Join in</strong><a href="#marketplace">Give</a><a href="#marketplace">Volunteer</a></div>
          <div><strong>Online</strong><a href="https://tuokoleane.org">tuokoleane.org</a><span>Kenya</span></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Tuokoleane Initiative</span><span>MVP preview • Payments are not connected</span></div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="package-title">
            <button className="close-button" onClick={() => setSelected(null)} aria-label="Close package details"><X /></button>
            <div className={`detail-art ${selected.accent}`}>
              <selected.icon size={86} strokeWidth={1.2} aria-hidden="true" />
              <span>{selected.label}</span>
            </div>
            <div className="detail-copy">
              <p className="package-program">{selected.program}</p>
              <h2 id="package-title">{selected.title}</h2>
              <p className="detail-description">{selected.description}</p>
              <ul className="includes-list">
                {selected.includes.map((item) => <li key={item}><Check size={17} aria-hidden="true" /> {item}</li>)}
              </ul>

              {selected.kind === "custom" && (
                <label className="amount-field">
                  <span>Your contribution</span>
                  <div><b>KSh</b><input inputMode="numeric" value={customAmount} onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ""))} aria-label="Contribution amount in Kenyan shillings" /></div>
                </label>
              )}

              <div className="detail-total">
                <div><small>{selected.kind === "time" ? "Commitment" : "Contribution"}</small><strong>{selected.kind === "custom" ? currency.format(Number(customAmount) || 0) : packagePrice(selected)}</strong></div>
                <button
                  className="primary-button"
                  disabled={selected.kind === "custom" && Number(customAmount) < 100}
                  onClick={() => addToBasket(selected, Number(customAmount))}
                >
                  {selected.kind === "time" ? "Add to my plan" : "Add to basket"} <ArrowRight size={18} />
                </button>
              </div>
              {selected.kind === "custom" && Number(customAmount) < 100 && <p className="field-error">Enter at least KSh 100 for this demo.</p>}
              <p className="scope-note"><ShieldCheck size={15} /> This is a prototype pledge. It does not reserve a placement or collect payment.</p>
            </div>
          </section>
        </div>
      )}

      {basketOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setBasketOpen(false)}>
          <aside className="basket-drawer" role="dialog" aria-modal="true" aria-labelledby="basket-title">
            <div className="drawer-header">
              <div><p className="eyebrow">Your plan</p><h2 id="basket-title">Kindness basket</h2></div>
              <button className="close-button inline" onClick={() => setBasketOpen(false)} aria-label="Close basket"><X /></button>
            </div>
            {basket.length === 0 ? (
              <div className="empty-basket">
                <span><ShoppingBag size={30} /></span>
                <h3>Your basket is empty</h3>
                <p>Start with one meal, one hour or one useful contribution.</p>
                <button className="primary-button" onClick={() => { setBasketOpen(false); scrollToMarketplace(); }}>Explore packages</button>
              </div>
            ) : (
              <>
                <div className="basket-items">
                  {basket.map((entry, index) => {
                    const Icon = entry.package.icon;
                    return (
                      <article className="basket-item" key={`${entry.package.id}-${entry.amount}`}>
                        <span className={`basket-icon ${entry.package.accent}`}><Icon size={22} /></span>
                        <div className="basket-item-copy"><strong>{entry.package.title}</strong><small>{entry.amount > 0 ? currency.format(entry.amount) : entry.package.duration}</small></div>
                        <div className="quantity-control">
                          <button onClick={() => updateQuantity(index, -1)} aria-label={`Remove one ${entry.package.title}`}><Minus size={14} /></button>
                          <span>{entry.quantity}</span>
                          <button onClick={() => updateQuantity(index, 1)} aria-label={`Add one ${entry.package.title}`}><Plus size={14} /></button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="basket-summary">
                  <div><span>Money contributions</span><strong>{currency.format(basketTotal)}</strong></div>
                  <div><span>Acts in this plan</span><strong>{basketCount}</strong></div>
                  <p><ShieldCheck size={16} /> Demo only. Nothing will be charged.</p>
                  <button className="primary-button full" onClick={openCheckout}>Review pledge <ArrowRight size={18} /></button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <Checkout basket={basket} total={basketTotal} onBack={() => { setCheckoutOpen(false); setBasketOpen(true); }} onClose={() => setCheckoutOpen(false)} onSubmit={finishPledge} />
      )}

      {confirmation && (
        <div className="modal-backdrop confirmation-backdrop" role="presentation">
          <section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <span className="success-icon"><Check size={34} strokeWidth={2.4} /></span>
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
      <header className="checkout-header">
        <button className="checkout-back" onClick={onBack}><ArrowLeft size={18} /> Back to basket</button>
        <a className="brand" href="#top" aria-label="Tuokoleane Initiative"><span className="brand-mark" aria-hidden="true">TI</span><span className="brand-copy"><strong>Tuokoleane</strong><small>Initiative</small></span></a>
        <button className="close-button inline" onClick={onClose} aria-label="Close checkout"><X /></button>
      </header>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <p className="eyebrow">Review your pledge</p>
          <h1 id="checkout-title">Who is this kindness from?</h1>
          <p className="checkout-lede">We only need enough information to show the flow. This preview saves nothing beyond your browser.</p>

          <div className="form-row two-columns">
            <label><span>Name {!anonymous && "*"}</span><input value={name} onChange={(event) => setName(event.target.value)} disabled={anonymous} aria-invalid={submitted && !anonymous && !name.trim()} placeholder="Your name" /></label>
            <label><span>Email *</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={submitted && !email.trim()} placeholder="you@example.com" /></label>
          </div>
          {submitted && (!email.trim() || (!anonymous && !name.trim())) && <p className="form-error">Add your email and either your name or choose to give anonymously.</p>}
          <label className="check-row"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /><span><strong>Give anonymously</strong><small>Your name would not appear in public donor recognition.</small></span></label>
          <label className="form-row"><span>A note for the team <small>Optional</small></span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Anything Tuokoleane should know about this pledge?" /></label>

          <div className="demo-payment">
            <div><ShieldCheck size={21} /><span><strong>Payment is intentionally off</strong><small>M-Pesa and card checkout will be connected only after the receiving account, safeguarding rules and refund process are confirmed.</small></span></div>
          </div>
          <button className="primary-button checkout-submit" type="submit">Create demo pledge <ArrowRight size={18} /></button>
          <p className="form-fineprint">By continuing, you create a local prototype record only. No donation, tax receipt or volunteer placement is created.</p>
        </form>

        <aside className="order-card">
          <div className="order-card-head"><p className="eyebrow">Your kindness plan</p><span>{actCount} {actCount === 1 ? "act" : "acts"}</span></div>
          <div className="order-lines">
            {basket.map((entry) => {
              const Icon = entry.package.icon;
              return <div className="order-line" key={`${entry.package.id}-${entry.amount}`}><span className={`basket-icon ${entry.package.accent}`}><Icon size={20} /></span><div><strong>{entry.package.title}{entry.quantity > 1 ? ` × ${entry.quantity}` : ""}</strong><small>{entry.package.program}</small></div><b>{entry.amount ? currency.format(entry.amount * entry.quantity) : "Time"}</b></div>;
            })}
          </div>
          <div className="order-total"><span>Total contribution</span><strong>{currency.format(total)}</strong></div>
          <p className="order-note"><CircleCheck size={17} /> You will see a confirmation before leaving this demo.</p>
        </aside>
      </div>
    </div>
  );
}

export default App;
