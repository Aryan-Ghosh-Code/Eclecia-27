export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "Our Tale", href: "/our-tale" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Team", href: "/team" },
] as const;

export const SPONSORSHIP_HEADS = [
  {
    initials: "DP",
    name: "Dipanjan Pal",
    role: "Sponsorship Head",
    email: "dipanjan.pal.ece27@heritageit.edu.in",
    phone: "+91 89277 34731",
  },
  {
    initials: "SR",
    name: "Sayandeep Roy",
    role: "Sponsorship Head",
    email: "sayandeep.roy.bt27@heritageit.edu.in",
    phone: "+91 82405 39282",
  },
  {
    initials: "PB",
    name: "Pawas Bhardwaj",
    role: "Sponsorship Head",
    email: "pawas.bhardwaj.ds27@heritageit.edu.in",
    phone: "+91 70709 91945",
  },
  {
    initials: "NR",
    name: "Nikhil Raj",
    role: "Sponsorship Head",
    email: "nikhil.raj.cse27@heritageit.edu.in",
    phone: "+91 62610 55645",
  },
] as const;

export const TEAM_MAILTO = `mailto:${[
  ...SPONSORSHIP_HEADS.map((h) => h.email),
  "eclecia@heritageit.edu",
].join(",")}?subject=${encodeURIComponent("Eclecia'27 · Sponsorship Enquiry")}`;

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/eclecia_hitk",
  linkedin: "https://www.linkedin.com/in/eclecia-hitk-552642434",
  facebook: "https://www.facebook.com/share/1Ja64ScqBF/",
  websiteHitk: "https://heritageit.edu/",
  emailOfficial: "eclecia@heritageit.edu",
  phonePrimary: "+91 94348 83745",
  phoneSecondary: "+91 89277 34731",
  phoneTertiary: "+91 83368 92188",
} as const;
