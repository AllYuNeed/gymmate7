import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function canUseAnalytics(id: string | undefined): id is string {
  return Boolean(id && /^G-[A-Z0-9]+$/i.test(id));
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!canUseAnalytics(GA_ID)) return;
    if (document.querySelector(`script[data-ga-id="${GA_ID}"]`)) return;

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("js", new Date());

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.dataset.gaId = GA_ID;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!canUseAnalytics(GA_ID) || !window.gtag) return;
    window.gtag("config", GA_ID, {
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
