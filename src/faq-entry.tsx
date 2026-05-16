import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { FaqSection } from "@/components/faq-section";
import "@/index.css";

const rootEl = document.getElementById("faq-root");

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <FaqSection />
    </StrictMode>,
  );
}
