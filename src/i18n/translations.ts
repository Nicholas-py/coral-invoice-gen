// All user-facing strings for the app, in English and French.
// Usage: `const { t } = useLanguage(); t.header.title`

export type Language = "en" | "fr";

export const translations = {
  en: {
    toggle: { label: "FR" },
    header: {
      title: "Invoice Creator",
      subtitle: "For NPs - create an invoice automatically + download a PDF.",
    },
    details: {
      name: "Your name",
      namePlaceholder: "Fiona Lake Waslander",
      rate: "Hourly rate (CAD)",
      ratePlaceholder: "120",
      address: "Address",
      addressPlaceholder: "1172 Sherbrooke St W, Montréal, QC H3A 1H6, Canada",
    },
    weeks: {
      title: "Weeks",
      subtitle: "Select the weeks the invoice is for.",
      selectPlaceholder: "Select weeks…",
      minimumHours: "Minimum Guaranteed Hours",
      jumpToToday: "Jump to today",
      weekLabel: "Week",
      weeksSelectedSingular: "week selected",
      weeksSelectedPlural: "weeks selected",
    },
    hours: {
      title: "Hours",
      subtitle: "Add a row for each work session.",
      addRow: "Add row",
      date: "Date",
      type: "Type",
      minutes: "Minutes",
      description: "Description",
      removeRow: "Remove row",
    },
    hourTypes: {
      consult: "Consultation time",
      train: "Training time or info session",
      admin: "Admin time outside of prep/post",
    },
    invoice: {
      title: "INVOICE",
      date: "Date",
      rate: "Rate",
      from: "FROM",
      billTo: "BILL TO",
      totalHours: "Total hours",
      total: "Total",
      weekTotal: "total hours",
      additionalMinHours: "Additional hours from minimum guarantee",
      detailsPage: "Details",
      tableType: "Type",
      tableHours: "Hours",
      tableDate: "Date",
      tableDescription: "Description",
      tableMinutes: "Minutes",
      generate: "Generate Invoice",
      errorMissingWeeks:
        "ERROR! Some dates selected aren't included in any of the weeks selected. Please select more weeks.",
    },
    footer: {
      disclaimer: "AI disclaimer - this page was generated using AI and edited by a human.",
      copyright: "©2026 Nicholas Waslander",
    },
  },
  fr: {
    toggle: { label: "EN" },
    header: {
      title: "Créateur de facture",
      subtitle: "Pour les IP - créez une facture automatiquement + téléchargez un PDF.",
    },
    details: {
      name: "Votre nom",
      namePlaceholder: "Fiona Lake Waslander",
      rate: "Taux horaire (CAD)",
      ratePlaceholder: "120",
      address: "Adresse",
      addressPlaceholder: "1172 Rue Sherbrooke O, Montréal, QC H3A 1H6, Canada",
    },
    weeks: {
      title: "Semaines",
      subtitle: "Sélectionnez les semaines couvertes par la facture.",
      selectPlaceholder: "Sélectionner des semaines…",
      minimumHours: "Heures minimales garanties",
      jumpToToday: "Aller à aujourd'hui",
      weekLabel: "Semaine",
      weeksSelectedSingular: "semaine sélectionnée",
      weeksSelectedPlural: "semaines sélectionnées",
    },
    hours: {
      title: "Heures",
      subtitle: "Ajoutez une ligne pour chaque séance de travail.",
      addRow: "Ajouter une ligne",
      date: "Date",
      type: "Type",
      minutes: "Minutes",
      description: "Description",
      removeRow: "Supprimer la ligne",
    },
    hourTypes: {
      consult: "Temps de consultation",
      train: "Formation ou séance d'information",
      admin: "Temps administratif hors préparation/post",
    },
    invoice: {
      title: "FACTURE",
      date: "Date",
      rate: "Taux",
      from: "DE",
      billTo: "FACTURER À",
      totalHours: "Heures totales",
      total: "Total",
      weekTotal: "heures totales",
      additionalMinHours: "Heures supplémentaires du minimum garanti",
      detailsPage: "Détails",
      tableType: "Type",
      tableHours: "Heures",
      tableDate: "Date",
      tableDescription: "Description",
      tableMinutes: "Minutes",
      generate: "Générer la facture",
      errorMissingWeeks:
        "ERREUR! Certaines dates sélectionnées ne font partie d'aucune des semaines choisies. Veuillez sélectionner plus de semaines.",
    },
    footer: {
      disclaimer: "Avertissement IA - cette page a été générée par IA et éditée par un humain.",
      copyright: "©2026 Nicholas Waslander",
    },
  },
} as const;

export type TranslationShape = (typeof translations)["en"];
