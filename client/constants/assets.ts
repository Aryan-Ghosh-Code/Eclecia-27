/**
 * Centralized constants file from which all public assets are served.
 * You can easily update or swap Cloudinary image URLs here.
 */

export const ASSETS = {
  cloudinary: {
    // Scene assets (naming aligned with public/assets/opt/)
    bg: "https://res.cloudinary.com/efkowwyw/image/upload/v1790507575/bg-layer1.webp",
    veena:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507580/veena.webp",
    hand: "https://res.cloudinary.com/efkowwyw/image/upload/v1790507579/hand.webp",
    banner:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507573/banner.webp",
    blacksun:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507576/blacksun-layer2.webp",
    blacksun2:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507575/blacksun2-layer3.webp",
    minisun:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507576/minisun-layer4.webp",
    suncover:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507577/suncoverbg-layer5.webp",
    mainart:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507583/mainart-layer6.webp",
    mainartMobile:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507578/mainart-mobile.webp",
    bottom:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507575/bottom.webp",
    divider:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507577/divider.webp",
    comingsoon:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507576/comingsoon.webp",
    hitkLogo:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507849/hitk-logo.webp",
    ecleciaLogo:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507848/eclecia-logo.webp",
    iicLogo:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507849/iic-logo.webp",
    wordmarkBlacker:
      "https://res.cloudinary.com/efkowwyw/image/upload/v1790507849/eclecia-wordmark-blacker.webp",
    brochure:
      "https://drive.google.com/file/d/1huw__jtk1waWvTXi8dyWO_R1GplVO9Iu/view?usp=sharing",
    ogImage: "/og.png",

    // Loader & Site Canvas Background
    loaderSun: "", // fallback: /assets/opt/loader/painted-sun-v1.webp
    eventsBackground:
      "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487659/background.webp", // fallback: /assets/opt/events/site/background.webp
    chakraFrame:
      "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487670/chakra-frame-v1.webp", // fallback: /assets/opt/events/mobile/chakra-frame-v1.webp

    // Events Atlas: Shared Canvas & Orbit Assets
    atlasShared: {
      coronaHalo:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487549/corona-halo.webp", //
      eclipseCore:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487549/eclipse-core.webp",
      eventOrbit:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487563/event-orbit.webp",
      goldDust:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487564/gold-dust.webp",
      medallionBase:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487565/medallion-base.webp",
      orbitPerspective:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487566/orbit-perspective-v2.webp",
      planetBase:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793487566/planet-base.webp",
    },

    // Category Artwork (7 Worlds)
    categories: {
      celeste:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482979/kalakriti.webp",
      "taal-tarang":
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482980/tandav.webp",
      anubhuti:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482979/natyam.webp",
      "bakya-rongo":
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482979/akshar.webp",
      aetheria:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482979/roop-rang.webp",
      cadence:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482979/sargram.webp",
      brahmand:
        "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793482979/brahmand.webp",
    } as Record<string, string>,

    // Event Artwork (by Category Slug -> Event Slug)
    events: {
      celeste: {
        patalila:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485960/patalila.webp",
        chitralekha:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485958/chitralekha.webp",
        rangarupam:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485960/rangarupam.webp",
        drishya:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485958/drishya.webp",
        framekatha:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793551179/framekatha.webp",
      },
      "taal-tarang": {
        manjari:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485992/manjari.webp",
        groovex:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485991/groovex.webp",
        angika:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485990/angika.webp",
        velocity:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485993/velocity.webp",
        glitch:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485991/glitch.webp",
      },
      anubhuti: {
        rangamancha:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485967/rangamancha.webp",
        hunkaar:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485966/hunkaar.webp",
        mukhosh:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485967/mukhosh.webp",
      },
      "bakya-rongo": {
        "echo-theatre":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485852/echo-theatre.webp",
        "the-odyssey":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485852/the-odyssey.webp",
        verbatim:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485852/verbatim.webp",
      },
      aetheria: {
        "the-incarnates":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485974/the-incarnates.webp",
      },
      cadence: {
        surkala:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485983/surkala.webp",
        voxtech:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485984/voxtech.webp",
        "solo-sync":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485982/solo-sync.webp",
        dhunkaar:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485982/dhunkaar.webp",
        unison:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485984/unison.webp",
      },
      brahmand: {
        veritasium:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485890/veritasium.webp",
        "india-crisis-conclave":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485889/india-crisis-conclave.webp",
        "the-unfiltered-mic":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485889/the-unfiltered-mic.webp",
        "headline-hustle":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485887/headline-hustle.webp",
        pentathlon:
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485888/pentathlon.webp",
        "kavi-sammelan":
          "https://res.cloudinary.com/ajpcnwvo/image/upload/v1793485889/kavi-sammelan.webp",
      },
    } as Record<string, Record<string, string>>,
  },
} as const;
