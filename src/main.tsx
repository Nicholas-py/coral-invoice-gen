import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { InvoiceCreator } from "@/components/InvoiceCreator";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/i18n/LanguageToggle";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <LanguageToggle />
      <InvoiceCreator />
    </LanguageProvider>
  </StrictMode>,
);