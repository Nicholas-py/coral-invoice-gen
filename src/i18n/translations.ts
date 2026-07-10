// All user-facing strings paired in English + French for easy comparison.
// Each leaf is { en, fr }. Use `useLanguage()` from LanguageContext to read them.

export type Language = "en" | "fr";
export type Pair = { en: string; fr: string };

export const translations = {
  toggle: {
    en: { en: "EN", fr: "EN" },
    fr: { en: "FR", fr: "FR" },
  },
  header: {
    title:    { en: "Invoice Creator",
                fr: "Créateur de facture" },
    subtitle: { en: "For NPs - create an invoice automatically + download a PDF.",
                fr: "Pour les IP - créez une facture automatiquement + téléchargez un PDF." },
  },
  details: {
    name:               { en: "Your name",
                          fr: "Votre nom" },
    namePlaceholder:    { en: "Fiona Lake Waslander",
                          fr: "Fiona Lake Waslander" },
    rate:               { en: "Hourly rate (CAD)",
                          fr: "Taux horaire (CAD)" },
    ratePlaceholder:    { en: "120",
                          fr: "120" },
    address:            { en: "Address",
                          fr: "Adresse" },
    addressPlaceholder: { en: "1172 Sherbrooke St W, Montréal, QC H3A 1H6, Canada",
                          fr: "1172 Rue Sherbrooke O, Montréal, QC H3A 1H6, Canada" },
  },
  weeks: {
    title:                   { en: "Weeks",
                               fr: "Semaines" },
    subtitle:                { en: "Select the weeks the invoice is for.",
                               fr: "Sélectionnez les semaines couvertes par la facture." },
    selectPlaceholder:       { en: "Select weeks…",
                               fr: "Sélectionner des semaines…" },
    minimumHours:            { en: "Minimum Guaranteed Hours",
                               fr: "Heures minimales garanties" },
    jumpToToday:             { en: "Jump to today",
                               fr: "Aller à aujourd'hui" },
    weekLabel:               { en: "Week",
                               fr: "Semaine" },
    weeksSelectedSingular:   { en: "week selected",
                               fr: "semaine sélectionnée" },
    weeksSelectedPlural:     { en: "weeks selected",
                               fr: "semaines sélectionnées" },
  },
  hours: {
    title:       { en: "Hours",
                   fr: "Heures" },
    subtitle:    { en: "Add a row for each work session.",
                   fr: "Ajoutez une ligne pour chaque séance de travail." },
    addRow:      { en: "Add row",
                   fr: "Ajouter une ligne" },
    date:        { en: "Date",
                   fr: "Date" },
    type:        { en: "Type",
                   fr: "Type" },
    minutes:     { en: "Minutes",
                   fr: "Minutes" },
    description: { en: "Description",
                   fr: "Description" },
    removeRow:   { en: "Remove row",
                   fr: "Supprimer la ligne" },
  },
  hourTypes: {
    consult: { en: "Consultation time",
               fr: "Temps de consultation" },
    train:   { en: "Training time or info session",
               fr: "Formation ou séance d'information" },
    admin:   { en: "Admin time outside of prep/post",
               fr: "Temps administratif hors préparation/post" },
  },
  actions: {
    generate: { en: "Generate Invoice",
                fr: "Générer la facture" },
  },
  footer: {
    disclaimer: { en: "AI disclaimer - this page was generated using AI and edited by a human.",
                  fr: "Avertissement IA - cette page a été générée par IA et éditée par un humain." },
    copyright:  { en: "©2026 Nicholas Waslander",
                  fr: "©2026 Nicholas Waslander" },
  },
} as const;

// Recursively resolve { en, fr } leaves to strings for the chosen language.
type Resolve<T> = T extends Pair
  ? string
  : { [K in keyof T]: Resolve<T[K]> };

export type TranslationShape = Resolve<typeof translations>;

export function resolve(lang: Language): TranslationShape {
  const walk = (node: any): any => {
    if (node && typeof node === "object" && "en" in node && "fr" in node
        && typeof node.en === "string" && typeof node.fr === "string") {
      return node[lang];
    }
    const out: any = {};
    for (const k of Object.keys(node)) out[k] = walk(node[k]);
    return out;
  };
  return walk(translations);
}
