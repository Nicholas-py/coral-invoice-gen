import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageContext";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <div className="fixed right-4 top-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        aria-label="Toggle language between English and French"
      >
        {lang === "en" ? "FR" : "EN"}
      </Button>
    </div>
  );
}
