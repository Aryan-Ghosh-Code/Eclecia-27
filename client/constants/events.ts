import { ASSETS } from "@/constants/assets";
/** Events atlas line-up: seven worlds, thirty events. Copy is short editorial
 *  framing only; dates, rules, fees and prizes are not invented here. The site
 *  reads each world's copy from here but its events from Mongo; these events
 *  only feed scripts/seed-events.ts. */

export interface AtlasEvent {
  id: string;
  name: string;
  description: string;
  kind: string;
  club?: string;
}

export interface AtlasCategory {
  id: string;
  name: string;
  kind: string;
  line: string;
  events: AtlasEvent[];
}

export const ATLAS_CATEGORIES: AtlasCategory[] = [
  {
    id: "kalakriti",
    name: "Kalakriti",
    kind: "Art & Photography",
    line: "Brushstrokes, frames and fabric, where every canvas holds a story waiting to be seen.",
    events: [
      // {
      //   id: "",
      //   name: "",
      //   description: "A story told through your lens.",
      //   kind: "Filmmaking",
      //   club: "Pravasana: The Art & Photography Club of HITK",
      // },
      {
        id: "patalila",
        name: "Patalila",
        description: "Turn fabric into a canvas of your own.",
        kind: "Fabric Painting",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "chitralekha",
        name: "Chitralekha",
        description: "Make an image that says it all.",
        kind: "Cover Art/ Poster Making",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "rangarupam",
        name: "Rangarupam",
        description: "An expression beyond the canvas.",
        kind: "Face Painting",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "drishya",
        name: "Drishya",
        description: "Find the extraordinary in a single frame.",
        kind: "Photography",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
    ],
  },
  {
    id: "tandav",
    name: "Tandav",
    kind: "Dance",
    line: "From classical grace to street-fire swagger, let every step shake the ground.",
    events: [
      {
        id: "manjari",
        name: "Manjari",
        description: "One dancer. A story in every gesture.",
        kind: "Solo Eastern Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "groovex",
        name: "Groovex",
        description: "Find your rhythm. Own the floor.",
        kind: "Solo Western Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "angika",
        name: "Angika",
        description: "Many dancers, one expression.",
        kind: "Group Eastern Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "velocity",
        name: "Velocity",
        description: "Move together. Make your mark.",
        kind: "Group Western Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "glitch",
        name: "Glitch",
        description: "Your crew. Your moves. Your moment.",
        kind: "Street Battle",
        club: "Ghungroo: The Dance Club of HITK",
      },
    ],
  },
  {
    id: "natyam",
    name: "Natyam",
    kind: "Drama",
    line: "Where characters come alive, stories unfold, and every moment commands the stage.",
    events: [
      {
        id: "rangamancha",
        name: "Rangamancha",
        description: "Bring a world to life before the curtain falls.",
        kind: "Stage Play",
        club: "Anubhav: The Drama Club of HITK",
      },
      {
        id: "hunkaar",
        name: "Hunkaar",
        description: "A voice that reaches beyond the stage.",
        kind: "Street Play",
        club: "Anubhav: The Drama Club of HITK",
      },
      {
        id: "mukhosh",
        name: "Mukhosh",
        description: "One performer. A thousand possibilities.",
        kind: "Monoact",
        club: "Anubhav: The Drama Club of HITK",
      },
    ],
  },
  {
    id: "akshar",
    name: "Akshar",
    kind: "Literary",
    line: "Where words find their voice, stories find their wings, and verses leave their mark.",
    events: [
      {
        id: "echo-theatre",
        name: "Echo Theatre",
        description: "Build an entire world through sound.",
        kind: "Audio Drama",
        club: "Anahita: The Literary Club of HITK",
      },
      {
        id: "the-odyssey",
        name: "The Odyssey",
        description: "Make us see the story you tell.",
        kind: "Storytelling",
        club: "Anahita: The Literary Club of HITK",
      },
      {
        id: "verbatim",
        name: "Verbatim",
        description: "Give every word a life of its own.",
        kind: "Recitation",
        club: "Anahita: The Literary Club of HITK",
      },
    ],
  },
  {
    id: "roop-rang",
    name: "Roop Rang",
    kind: "Fashion",
    line: "Beyond the runway and disguise, wear your imagination with pride.",
    events: [
      // {
      //   id: "",
      //   name: "",
      //   description: "Carry your story down the runway.",
      //   kind: "Ramp Walk",
      //   club: "The Heritage Fashion Club",
      // },
      {
        id: "the-incarnates",
        name: "The Incarnates",
        description: "Step into a character. Make it yours.",
        kind: "Cosplay",
        club: "The Heritage Fashion Club",
      },
    ],
  },
  {
    id: "sargam",
    name: "Sargam",
    kind: "Music",
    line: "Voices, strings and rhythms collide as seven notes spill into infinite stories.",
    events: [
      {
        id: "surkala",
        name: "SurKala",
        description:
          "The eastern solo singing competition is a celebration of classical and contemporary vocal traditions from across the  East. Showcasing exceptional solo talents in genres such as Hindustani, Carnatic,and other indigenous styles",
        kind: "Solo Singing (Eastern)",
        club: "Resonance: The Music Club of HITK",
      },
      {
        id: "voxtech",
        name: "Voxtech",
        description:
          "The western solo singing event that celebrates the art of vocal performance, individual expression and stage presence across diverse western music genres such as pop, rock, jazz, blues, and contemporary hits.",
        kind: "Solo Singing (Western)",
        club: "Resonance: The Music Club of HITK",
      },
      {
        id: "solo-sync",
        name: "Solo-Sync",
        description:
          "Solo Sync is the ultimate solo instrumental faceoff, from soulful strings to electrifying riffs and mesmerizing keys - it's all about pure, unfiltered musical expression. No lyrics. No limits. Just you and your instrument in perfect sync!",
        kind: "Solo Instrumental",
        club: "Resonance: The Music Club of HITK",
      },
      {
        id: "dhunkaar",
        name: "Dhunkaar",
        description:
          "Get ready to witness the electrifying rhythm of Dhunkaar - Eastern Band competition, Where the soulful strains of tradition collide with the raw energy of live music, and every beat echoes the spirit of the East. From mesmerizing melodies to thunderous rhythms, it's a musical battlefield where passion meets prowess and only the most captivating band will strike the winning chord. Tune into the roots, unleash the rhythm, and let the Eastern soundscape roar - the stage is yours to conquer!",
        kind: "Eastern Band Competition",
        club: "Resonance: The Music Club of HITK",
      },
      {
        id: "unison",
        name: "Unison",
        description:
          "Where thunderous riffs collide, pounding drums ignite the stage, and raw vocals tear through the silence. This isn't just a competition - it's an all-out sonic showdown where attitude meets aggression, and only the band that can shake the ground and command the crowd will seize the crown. Crank up the amps, unleash the distortion, and let the music wage war - the stage is yours to dominate!",
        kind: "Western Band Competition",
        club: "Resonance: The Music Club of HITK",
      },
    ],
  },
  {
    id: "brahmand",
    name: "Brahmand",
    kind: "Beyond the Realm",
    line: "Debates, quizzes and verses for minds that never stop chasing the next question.",
    events: [
      // {
      //   id: "",
      //   name: "",
      //   description: "Take a stand. Make your argument count.",
      //   kind: "Oxford Debate",
      //   club: "DEBSOC: The Heritage Debating Society",
      // },
      {
        id: "veritasium",
        name: "Veritasium",
        description: "Follow your curiosity to the next answer.",
        kind: "U25 General Quiz",
        club: "Atmadweep: The Quiz Club of HITK",
      },
      {
        id: "india-crisis-conclave",
        name: "India Crisis Conclave",
        description: "Think deeply. Speak with conviction.",
        kind: "Conclave",
        club: "News Club of HITK",
      },
      {
        id: "the-unfiltered-mic",
        name: "The Unfiltered Mic",
        description: "A microphone. Your unfiltered voice.",
        kind: "Open mic",
        club: "News Club of HITK",
      },
      {
        id: "headline-hustle",
        name: "Headline Hustle",
        description: "Find the story. Make the headline.",
        kind: "Media challenge",
        club: "News Club of HITK",
      },
      {
        id: "pentathlon",
        name: "Pentathlon",
        description: "Let every sher leave an impression.",
        kind: "Shayari Competition",
        club: "Zubaan: The Language Club of HITK",
      },
      {
        id: "kavi-sammelan",
        name: "Kavi Sammelan",
        description: "An assembly of voices, united by poetry.",
        kind: "Poetry Recitation",
        club: "Zubaan: The Language Club of HITK",
      },
    ],
  },
];

/** Atlas art: prefers Cloudinary URLs from ASSETS/MongoDB if set, else falls back to local assets */
const ATLAS_MEDIA = "/assets/opt/events";

const SHARED_KEY_MAP: Record<string, keyof typeof ASSETS.cloudinary.atlasShared> = {
  "corona-halo": "coronaHalo",
  "eclipse-core": "eclipseCore",
  "event-orbit": "eventOrbit",
  "gold-dust": "goldDust",
  "medallion-base": "medallionBase",
  "orbit-perspective-v2": "orbitPerspective",
  "planet-base": "planetBase",
};

export const atlasArt = {
  shared: (name: string) => {
    const key = SHARED_KEY_MAP[name];
    const cloudUrl = key ? ASSETS.cloudinary.atlasShared[key] : "";
    return cloudUrl || `${ATLAS_MEDIA}/shared/${name}.webp`;
  },
  category: (categoryId: string, dbImage?: string) => {
    if (dbImage) return dbImage;
    const cloudUrl = ASSETS.cloudinary.categories[categoryId];
    return cloudUrl || `${ATLAS_MEDIA}/categories/${categoryId}.webp`;
  },
  event: (categoryId: string, eventId: string, dbImage?: string) => {
    if (dbImage) return dbImage;
    const catEvents = ASSETS.cloudinary.events[categoryId];
    const cloudUrl = catEvents ? catEvents[eventId] : "";
    return cloudUrl || `${ATLAS_MEDIA}/events/${categoryId}/${eventId}.webp`;
  },
} as const;
