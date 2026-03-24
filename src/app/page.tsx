"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

export default function HomePage() {
  const { t } = useLocale();

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui", padding: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "12px" }}>Khalidae</h1>
        <p style={{ fontSize: "20px", opacity: 0.8 }}>{t("home.tagline")}</p>
        <p style={{ fontSize: "14px", opacity: 0.6, maxWidth: "640px", marginTop: "12px" }}>
          {t("home.description")}
        </p>
      </div>
    </main>
  );
}
