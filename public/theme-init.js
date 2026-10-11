(() => {
  const storageKey = "ti-theme-preference-v1";
  let preference = "light";

  try {
    const storedPreference = window.localStorage.getItem(storageKey);
    if (storedPreference === "system" || storedPreference === "light" || storedPreference === "dark") {
      preference = storedPreference;
    }
  } catch {}

  const systemIsDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const resolvedTheme = preference === "system" ? (systemIsDark ? "dark" : "light") : preference;
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolvedTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolvedTheme === "dark" ? "#101219" : "#ffffff");
})();
