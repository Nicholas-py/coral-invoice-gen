import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { InvoiceCreator } from "@/components/InvoiceCreator";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InvoiceCreator />
  </StrictMode>,
);