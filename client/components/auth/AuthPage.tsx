import AuthComingSoon from "./AuthComingSoon";
/* eslint-disable @next/next/no-img-element */
import { Suspense, type ReactNode } from "react";
import { auth, googleEnabled } from "@/auth";
import { SiteHeader } from "@/components/common/Header";
import { SiteFooter } from "@/components/common/Footer";
import { PageFade } from "@/components/common/PageFade";
import { ASSETS } from "@/constants/assets";
import { AuthPanel } from "./AuthPanel";
import "@/styles/auth.css";

/** Server shell for the (auth) layout: reads the session, renders the panel. */
export async function AuthPage({ children }: { children: ReactNode }) {
  if (process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "true") {
    return <AuthComingSoon />;
  }
  let session = null;
  try {
    session = await auth();
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("[auth] failed to retrieve session in AuthPage:", err);
    session = null;
  }

  return (
    <PageFade className="min-h-dvh">
      <div className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-black text-parchment">
        <img
          src={ASSETS.cloudinary.bg}
          alt=""
          aria-hidden
          className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-60"
        />
        <SiteHeader />
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-14 pt-24 md:pb-10 md:pt-24">
          <Suspense fallback={null}>
            <AuthPanel
              googleEnabled={googleEnabled}
              user={session?.user ? { username: session.user.username, email: session.user.email } : null}
            />
          </Suspense>
        </main>
        <SiteFooter />
        {children}
      </div>
    </PageFade>
  );
}
