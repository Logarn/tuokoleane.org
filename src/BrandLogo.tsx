import type { ImgHTMLAttributes } from "react";

type BrandLogoVariant = "wordmark" | "symbol";
type BrandLogoAppearance = "adaptive" | "light" | "dark" | "white";

interface BrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> {
  variant?: BrandLogoVariant;
  appearance?: BrandLogoAppearance;
}

const brandAssets: Record<BrandLogoVariant, {
  light: string;
  dark: string;
  white: string;
  width: number;
  height: number;
}> = {
  wordmark: {
    light: "/images/brand/tuokoleane-wordmark-blue.png",
    dark: "/images/brand/tuokoleane-wordmark-dark.png",
    white: "/images/brand/tuokoleane-wordmark-white.png",
    width: 1880,
    height: 645,
  },
  symbol: {
    light: "/images/brand/tuokoleane-symbol-blue.png",
    dark: "/images/brand/tuokoleane-symbol-dark.png",
    white: "/images/brand/tuokoleane-symbol-white.png",
    width: 824,
    height: 801,
  },
};

export function BrandLogo({
  variant = "wordmark",
  appearance = "adaptive",
  alt = "Tuokoleane Initiative",
  className,
  decoding = "async",
  ...imageProps
}: BrandLogoProps) {
  const asset = brandAssets[variant];
  const source = appearance === "adaptive" ? asset.light : asset[appearance];

  return (
    <picture className={className}>
      {appearance === "adaptive" && <source media="(prefers-color-scheme: dark)" srcSet={asset.dark} />}
      <img
        {...imageProps}
        src={source}
        alt={alt}
        width={asset.width}
        height={asset.height}
        decoding={decoding}
      />
    </picture>
  );
}
