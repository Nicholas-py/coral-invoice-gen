import { Switch } from "@/components/ui/switch";
import { useLanguage } from "./LanguageContext";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const isFr = lang === "fr";
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
      <span
        className={`text-sm font-medium ${isFr ? "text-muted-foreground" : "text-foreground"}`}
      >
        EN
      </span>
      <Switch
        checked={isFr}
        onCheckedChange={(checked) => setLang(checked ? "fr" : "en")}
        aria-label="Toggle language between English and French"
      />
      <span
        className={`text-sm font-medium ${isFr ? "text-foreground" : "text-muted-foreground"}`}
      >
        FR
      </span>
    </div>
  );
}
