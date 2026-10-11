import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Program } from "./data";

interface MobileProgramsProps {
  programs: Program[];
  onNavigate: (path: string) => void;
}

export default function MobilePrograms({ programs, onNavigate }: MobileProgramsProps) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = Math.max(programs.length - 1, 0);

  const moveTo = (nextIndex: number, behavior: ScrollBehavior = "smooth") => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), lastIndex);
    setActiveIndex(boundedIndex);
    const viewport = viewportRef.current;
    viewport?.scrollTo?.({ left: boundedIndex * viewport.clientWidth, behavior });
  };

  useEffect(() => {
    setActiveIndex(0);
    viewportRef.current?.scrollTo?.({ left: 0, behavior: "auto" });
  }, [programs.length]);

  if (!programs.length) return null;

  return (
    <section className="mobile-programs" aria-label="Tuokoleane programs and events" aria-roledescription="carousel">
      <p className="mobile-catalogue-sr-only" aria-live="polite" aria-atomic="true">
        Program {activeIndex + 1} of {programs.length}. Showing {programs[activeIndex].name}.
      </p>
      <div
        id={viewportId}
        ref={viewportRef}
        className="mobile-programs-viewport"
        role="group"
        aria-label="Programs and events"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveTo(activeIndex - 1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveTo(activeIndex + 1);
          }
        }}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          if (!viewport.clientWidth) return;
          setActiveIndex(Math.min(Math.max(Math.round(viewport.scrollLeft / viewport.clientWidth), 0), lastIndex));
        }}
      >
        {programs.map((program, index) => {
          const path = `/program/${program.id}`;
          return (
            <article className={`mobile-program-card${program.featured ? " mobile-program-card-featured" : ""}`} aria-label={`${program.name}, program ${index + 1} of ${programs.length}`} key={program.id}>
              <a href={path} onClick={(event) => { event.preventDefault(); onNavigate(path); }}>
                <span className="mobile-program-image">
                  <img src={program.image} alt={program.imageAlt} loading="lazy" decoding="async" />
                  {program.featured && <b>Featured annual event</b>}
                </span>
                <span className="mobile-program-copy">
                  <small>{program.kicker}</small>
                  <strong>{program.name}</strong>
                  {program.eventDate && <time dateTime={program.eventDateIso}><CalendarDays size={14} /> {program.eventDateShort ?? program.eventDate}</time>}
                  <span>{program.summary}</span>
                  <em>Explore <ChevronRight size={17} /></em>
                </span>
              </a>
            </article>
          );
        })}
      </div>
      <div className="mobile-catalogue-controls">
        <span aria-hidden="true">{activeIndex + 1} of {programs.length}</span>
        <div>
          <button type="button" aria-label="Previous program" aria-controls={viewportId} disabled={activeIndex === 0} onClick={() => moveTo(activeIndex - 1)}><ChevronLeft aria-hidden="true" size={19} /></button>
          <button type="button" aria-label="Next program" aria-controls={viewportId} disabled={activeIndex === lastIndex} onClick={() => moveTo(activeIndex + 1)}><ChevronRight aria-hidden="true" size={19} /></button>
        </div>
      </div>
    </section>
  );
}
