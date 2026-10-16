import {
  SPONSORSHIP_HEADS,
  TEAM_MAILTO,
  SOCIAL_LINKS,
} from "@/constants/navigation";

export { SPONSORSHIP_HEADS, TEAM_MAILTO };

const SOCIALS = [
  {
    name: "Instagram",
    href: SOCIAL_LINKS.instagram,
    icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    href: SOCIAL_LINKS.linkedin,
    icon: LinkedInIcon,
  },
  {
    name: "Facebook",
    href: SOCIAL_LINKS.facebook,
    icon: FacebookIcon,
  },
];

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.8v1.6h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.65 4.78 6.1v5.3h-4v-4.7c0-1.12-.02-2.56-1.56-2.56-1.57 0-1.8 1.22-1.8 2.48v4.78h-4v-11Z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M13.5 21v-7.5h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.49-1.46h1.6V4.46A21 21 0 0 0 14.27 4c-2.3 0-3.87 1.4-3.87 3.98V10.5H7.8v3h2.6V21h3.1Z" />
    </svg>
  );
}

const link = "transition-colors hover:text-gold";

/**
 * <sm (phone): original 2-group centered stack — brand+email+phones wrap
 *   together as one block, socials+credit wrap together as another.
 * sm–lg (tablet): 2 tight rows — brand+email / phones+socials (credit dropped
 *   here to keep it concise — three phone numbers already fill the line).
 * lg+ (desktop): original single-line layout, unchanged, credit text kept.
 */
export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`relative z-100 bg-black/80 backdrop-blur-md border-t border-gold/15 px-4 py-3 pb-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-parchment/80 sm:py-3 lg:px-[4vw] lg:py-4 ${className}`}
    >
      {/* ---------- <sm: exactly 3 rows — brand+email / phones / socials+credit ---------- */}
      <div className="flex flex-col items-center justify-center gap-1 sm:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <BrandBit />
          <span className="text-gold/30">·</span>
          <EmailBit />
        </div>
        <PhoneBits tight />
        <div className="flex items-center justify-center gap-2.5">
          <SocialIcons />
          <span className="text-gold/30">·</span>
          <CreditBit />
        </div>
      </div>

      {/* ---------- sm to lg: 2 concise rows, no credit text ---------- */}
      <div className="hidden flex-col items-center justify-center gap-1.5 sm:flex lg:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
          <BrandBit />
          <span className="text-gold/30">·</span>
          <EmailBit />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
          <PhoneBits roomy />
          <span className="text-gold/30">·</span>
          <SocialIcons />
        </div>
      </div>

      {/* ---------- lg+: original single line ---------- */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-x-8 lg:text-left">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <BrandBit />
          <span className="text-gold/30">·</span>
          <EmailBit />
          <span className="text-gold/30">·</span>
          <PhoneBits roomy />
        </div>
        <div className="flex items-center gap-3">
          <SocialIcons />
          <span className="text-gold/30">·</span>
          <CreditBit />
        </div>
      </div>
    </footer>
  );
}

function BrandBit() {
  return (
    <span className="whitespace-nowrap text-gold/90 font-semibold">
      © 2027 ECLECIA
    </span>
  );
}

function EmailBit() {
  return (
    <a
      href={`mailto:${SOCIAL_LINKS.emailOfficial}`}
      className={`${link} whitespace-nowrap normal-case tracking-widest`}
    >
      {SOCIAL_LINKS.emailOfficial}
    </a>
  );
}

function PhoneBits({
  roomy = false,
  tight = false,
}: {
  roomy?: boolean;
  tight?: boolean;
}) {
  const numbers = [
    SOCIAL_LINKS.phonePrimary,
    SOCIAL_LINKS.phoneSecondary,
    SOCIAL_LINKS.phoneTertiary,
  ];
  return (
    <span
      className={`flex flex-nowrap items-center justify-center ${
        tight
          ? "gap-x-1.5 tracking-normal text-[9px]"
          : roomy
            ? "gap-x-3 gap-y-0.5"
            : "gap-x-2 gap-y-0.5"
      }`}
    >
      {numbers.map((num, i) => (
        <span key={num} className="flex items-center gap-x-1.5">
          {i > 0 && <span className="text-gold/30">·</span>}
          <a
            href={`tel:${num.replace(/\s/g, "")}`}
            className={`${link} whitespace-nowrap`}
          >
            {num}
          </a>
        </span>
      ))}
    </span>
  );
}

function SocialIcons() {
  return (
    <span className="flex items-center gap-2.5">
      {SOCIALS.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className={`${link} text-gold/80 hover:text-gold`}
        >
          <Icon />
        </a>
      ))}
    </span>
  );
}

function CreditBit() {
  return (
    <span className="whitespace-nowrap normal-case tracking-[0.08em] text-parchment/70 text-[9.5px]">
      Made with <span className="text-gold">♥</span> by Eclecia Tech Team
    </span>
  );
}
