import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { InvoiceCreator } from "@/components/InvoiceCreator";
import { LanguageProvider } from "@/language/LanguageContext";
import { LanguageToggle } from "@/language/LanguageToggle";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <LanguageToggle />
      <InvoiceCreator />
    </LanguageProvider>
  </StrictMode>,
);