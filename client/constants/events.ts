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
      {
        id: "framekatha",
        name: "FrameKatha",
        description:
          "Unleash your storytelling skills through the art of filmmaking. Create compelling short films filled with creativity, emotions and powerful narratives. Bring your imagination to life through cinematic frames and leave a lasting impression on audiences.",
        kind: "Short Film",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "patalila",
        name: "Patalila",
        description:
          "Transform plain fabrics into colourful masterpieces through artistic expression. Explore your creativity with vibrant colours, unique patterns and imaginative designs. Let every brushstroke tell a story and turn ordinary fabric into extraordinary artwork.",
        kind: "Fabric Painting",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "chitralekha",
        name: "Chitralekha",
        description:
          "Showcase your artistic vision through creative cover art and poster designs. Blend imagination, colours and visual storytelling to create eye-catching compositions. Transform simple ideas into striking designs that communicate emotions, concepts and stories.",
        kind: "Cover Art/ Poster Making",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "rangarupam",
        name: "Rangarupam",
        description:
          "Turn faces into living canvases with vibrant colours and imaginative designs. Express your creativity through artistic patterns, characters and visual storytelling. Combine originality, precision and teamwork to create stunning face art that captures attention.",
        kind: "Face Painting",
        club: "Pravasana: The Art & Photography Club of HITK",
      },
      {
        id: "drishya",
        name: "Drishya",
        description:
          "Capture extraordinary stories through the lens of your camera. Explore the beauty of everyday moments, unique perspectives and visual storytelling. Transform fleeting moments into timeless memories through creative composition, observation and artistic vision.",
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
        description:
          "A celebration of timeless traditions and artistic elegance, where soulful expressions, captivating rhythms, and graceful movements bring the rich cultural heritage of the East to life.",
        kind: "Solo Eastern Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "groovex",
        name: "Groovex",
        description:
          "A stage for individuality and innovation, where bold moves, infectious beats, and personal style collide to create an electrifying celebration of contemporary dance.",
        kind: "Solo Western Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "angika",
        name: "Angika",
        description:
          "Where tradition meets togetherness, celebrating cultural roots through mesmerizing choreography, rhythmic harmony, and synchronized expressions that transform every performance into a visual masterpiece.",
        kind: "Group Eastern Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "velocity",
        name: "Velocity",
        description:
          "A spectacular fusion of energy, creativity, and coordination, where teams unite through dynamic choreography, vibrant beats, and powerful performances to set the stage ablaze.",
        kind: "Group Western Dance",
        club: "Ghungroo: The Dance Club of HITK",
      },
      {
        id: "glitch",
        name: "Glitch",
        description:
          "An ultimate showdown of moves and music, where attitude meets artistry! A thrilling face-off of freestyle, originality, and raw talent, as dancers battle through rhythm, creativity, and unstoppable energy.",
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
        description:
          "A vivid tapestry of emotions unfolds on stage, where every tale is a mirror to life's intricate dance. Experience drama that lingers long after the curtains fall. Experience the magic long after the lights go out. ",
        kind: "Stage Play",
        club: "Anubhav: The Drama Club of HITK",
      },
      {
        id: "hunkaar",
        name: "Hunkaar",
        description:
          "The 'Roar of the Streets' echoes through powerful narratives, challenging norms and stirring change. Witness the raw energy of street theatre that speaks truth to power. Witness the spark of imagination and grandeur of streets.",
        kind: "Street Play",
        club: "Anubhav: The Drama Club of HITK",
      },
      {
        id: "mukhosh",
        name: "Mukhosh",
        description:
          "Beneath a lone spotlight, one soul becomes many. Mukhosh unravels the dance between mask and truth, where silence speaks, and a single act echoes countless emotions.",
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
        description:
          "No screens, just sounds. Build a world through voices, music, and sound effects. Let emotions collide, characters breathe, and imagination take centre stage.",
        kind: "Audio Drama",
        club: "Anahita: The Literary Club of HITK",
      },
      {
        id: "the-odyssey",
        name: "The Odyssey",
        description:
          "One story. One storyteller. Endless possibilities. Take us through unexpected twists, beautiful lies, and little heartbreaks. Hold our attention, and leave us wanting more.",
        kind: "Single Storytelling",
        club: "Anahita: The Literary Club of HITK",
      },
      {
        id: "verbatim",
        name: "Verbatim",
        description:
          "Some words deserve more than a page. Bring poetry, prose, or powerful verses to life with your voice, expression, and a little dramatic flair.",
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
      {
        id: "aurelis",
        name: "AURELIS",
        description:
          "The premier inter-collegiate runway arena where dragonlord grandeur meets avant-garde couture, challenging top student designers to bring the fire, factional rivalries, and imperial regalia of Westeros to life.",
        kind: "Ramp Walk",
        club: "The Heritage Fashion Club",
      },
      {
        id: "the-incarnates",
        name: "The Incarnates",
        description:
          "Step into the dragonlords' court as legends from any realm. This inter-college cosplay showdown challenges participants to embody iconic characters through exceptional craftsmanship and commanding stage presence.",
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
          "The Eastern Solo Singing Competition celebrates classical and contemporary vocal traditions from across the East. Showcasing exceptional solo talents in genres such as Hindustani, Carnatic, and other indigenous styles.",
        kind: "Solo Singing (Eastern)",
        club: "Resonance: The Music Club of HITK",
      },
      {
        id: "voxtech",
        name: "Voxtech",
        description:
          "The Western Solo Singing event that celebrates the art of vocal performance, individual expression and stage presence across diverse western music genres such as pop, rock, jazz, blues, and contemporary hits.",
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
          "Witness Dhunkaar, where Eastern traditions collide with electrifying live music, soulful melodies meet thunderous rhythms, and passionate bands battle to captivate audiences and claim musical glory on stage!",
        kind: "Eastern Band Competition",
        club: "Resonance: The Music Club of HITK",
      },
      {
        id: "unison",
        name: "Unison",
        description:
          "Where thunderous riffs, pounding drums, and raw vocals ignite an electrifying sonic showdown. Unleash the distortion, command the crowd, and let your music dominate the stage!",
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
        description:
          "Where curiosity sparks and knowledge shines, test your wits, trust your instincts, and battle across science, history, sports, and more to claim the ultimate glory!",
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
      // {
      //   id: "kavi-sammelan",
      //   name: "Kavi Sammelan",
      //   description: "An assembly of voices, united by poetry.",
      //   kind: "Poetry Recitation",
      //   club: "Zubaan: The Language Club of HITK",
      // },
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
