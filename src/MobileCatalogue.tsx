import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { KindnessPackage } from "./data";
import FavoriteButton from "./FavoriteButton";
import "./mobile-catalogue.css";

const ROW_COUNT = 3;
const VISIBLE_COLUMNS = 1;

interface MobileCatalogueProps {
  items: KindnessPackage[];
  onNavigate: (path: string) => void;
}

function formatPrice(item: KindnessPackage) {
  if (item.kind === "time") return "Give your time";
  if (item.kind === "custom") return `Ksh ${(item.price ?? 500).toLocaleString("en-KE")} suggested`;
  return `Ksh ${(item.price ?? 0).toLocaleString("en-KE")}`;
}

export default function MobileCatalogue({ items, onNavigate }: MobileCatalogueProps) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLUListElement>(null);
  const [columnIndex, setColumnIndex] = useState(0);
  const itemSignature = items.map((item) => item.id).join("|");
  const columnCount = Math.ceil(items.length / ROW_COUNT);
  const finalColumnIndex = Math.max(columnCount - VISIBLE_COLUMNS, 0);
  const activeColumnIndex = Math.min(columnIndex, finalColumnIndex);
  const firstVisibleItem = activeColumnIndex * ROW_COUNT + 1;
  const lastVisibleItem = Math.min((activeColumnIndex + VISIBLE_COLUMNS) * ROW_COUNT, items.length);

  const itemOffsets = useMemo(
    () => Array.from({ length: columnCount }, (_, index) => index * ROW_COUNT),
    [columnCount],
  );

  const moveToColumn = (nextColumn: number, behavior: ScrollBehavior = "smooth") => {
    const boundedColumn = Math.min(Math.max(nextColumn, 0), finalColumnIndex);
    setColumnIndex(boundedColumn);
    const viewport = viewportRef.current;
    const targetItem = viewport?.children.item(itemOffsets[boundedColumn] ?? 0) as HTMLElement | null;
    viewport?.scrollTo?.({ left: targetItem?.offsetLeft ?? 0, behavior });
  };

  useEffect(() => {
    setColumnIndex(0);
    viewportRef.current?.scrollTo?.({ left: 0, behavior: "auto" });
  }, [itemSignature]);

  if (!items.length) return null;

  return (
    <section className="mobile-catalogue" aria-label="Ways to help" aria-roledescription="carousel">
      <p className="mobile-catalogue-sr-only" aria-live="polite" aria-atomic="true">
        Showing ways to help {firstVisibleItem} to {lastVisibleItem} of {items.length}.
      </p>

      <div className="mobile-catalogue-controls">
        <button
          type="button"
          aria-label="Previous ways to help"
          aria-controls={viewportId}
          disabled={activeColumnIndex === 0}
          onClick={() => moveToColumn(activeColumnIndex - VISIBLE_COLUMNS)}
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <button
          type="button"
          aria-label="Next ways to help"
          aria-controls={viewportId}
          disabled={activeColumnIndex === finalColumnIndex}
          onClick={() => moveToColumn(activeColumnIndex + VISIBLE_COLUMNS)}
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      <ul
        id={viewportId}
        ref={viewportRef}
        className="mobile-catalogue-viewport"
        aria-label="Swipe through ways to help"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveToColumn(activeColumnIndex - VISIBLE_COLUMNS);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveToColumn(activeColumnIndex + VISIBLE_COLUMNS);
          }
        }}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          const columnOffsets = itemOffsets.map((itemIndex) => {
            const item = viewport.children.item(itemIndex) as HTMLElement | null;
            return Math.abs((item?.offsetLeft ?? 0) - viewport.scrollLeft);
          });
          const nearestColumn = columnOffsets.indexOf(Math.min(...columnOffsets));
          setColumnIndex(Math.min(Math.max(nearestColumn, 0), finalColumnIndex));
        }}
      >
        {items.map((item) => {
          const path = `/listing/${item.id}`;

          return (
            <li key={item.id}>
              <article className="mobile-package-card">
                <a
                  className="mobile-package-link"
                  href={path}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(path);
                  }}
                  aria-label={`View ${item.title}, ${formatPrice(item)}`}
                >
                  <span className="mobile-package-image">
                    <img src={item.images[0].src} alt={item.images[0].alt} loading="lazy" decoding="async" />
                    {item.specialBadge && <small>{item.specialBadge}</small>}
                  </span>
                  <span className="mobile-package-copy">
                    <strong>{item.title}</strong>
                    <span className="mobile-package-program">{item.program}</span>
                    <b>{formatPrice(item)}</b>
                  </span>
                </a>
                <FavoriteButton className="mobile-listing-favourite" itemId={item.id} itemTitle={item.title} />
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
