import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";

const STORAGE_KEY = "tuokoleane-favourite-listings";
const CHANGE_EVENT = "tuokoleane:favourites-changed";

function readFavourites() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set<string>(Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []);
  } catch {
    return new Set<string>();
  }
}

interface FavoriteButtonProps {
  itemId: string;
  itemTitle: string;
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({ itemId, itemTitle, className = "", showText = false }: FavoriteButtonProps) {
  const [isFavourite, setIsFavourite] = useState(() => readFavourites().has(itemId));

  useEffect(() => {
    const sync = () => setIsFavourite(readFavourites().has(itemId));
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, [itemId]);

  const toggle = useCallback(() => {
    const favourites = readFavourites();
    if (favourites.has(itemId)) favourites.delete(itemId);
    else favourites.add(itemId);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favourites]));
    } catch {
      // The control still works for this page when storage is unavailable.
    }

    setIsFavourite(favourites.has(itemId));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [itemId]);

  return (
    <button
      className={`listing-favourite${isFavourite ? " is-favourite" : ""}${className ? ` ${className}` : ""}`}
      type="button"
      aria-label={`${isFavourite ? "Remove" : "Add"} ${itemTitle} ${isFavourite ? "from" : "to"} favourites`}
      aria-pressed={isFavourite}
      onClick={toggle}
    >
      <Heart aria-hidden="true" size={20} fill={isFavourite ? "currentColor" : "none"} />
      {showText && <span>{isFavourite ? "Saved" : "Save"}</span>}
    </button>
  );
}
