import { createFileRoute } from "@tanstack/react-router";
import { InvoiceCreator } from "@/components/InvoiceCreator";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <InvoiceCreator />;
}
