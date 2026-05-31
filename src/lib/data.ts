export type Season = "spring" | "summer" | "autumn" | "winter";
export type Weather = "sunny" | "cloudy" | "rainy" | "snowy" | "foggy";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  season: Season;
  weather: Weather;
  tags: string[];
  images: string[];
  youtubeId?: string;
  likes: number;
}

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  done: boolean;
}

export const POSTS: Post[] = [
  {
    id: "1",
    slug: "ankunft-tokyo",
    title: "Angekommen in Tōkyō!",
    excerpt: "Nach 12 Stunden Flug stehe ich endlich in Shinjuku und kann es noch nicht glauben.",
    content: `Nach einem langen Flug über Amsterdam bin ich endlich in Tōkyō angekommen. Die erste Nacht in Shinjuku war überwältigend — die Lichter, die Menschenmassen, der Lärm... und trotzdem alles so geordnet und sauber.

Ich habe meinen Koffer im Hostel abgestellt und bin sofort losgezogen. Shinjuku bei Nacht ist wie aus einem Cyberpunk-Film.`,
    date: "2025-09-01",
    location: "Tōkyō, Shinjuku",
    lat: 35.6938,
    lng: 139.7034,
    season: "summer",
    weather: "cloudy",
    tags: ["Tōkyō", "Ankunft", "Shinjuku"],
    images: [],
    likes: 24,
  },
  {
    id: "2",
    slug: "kyoto-herbst",
    title: "Kyōto im Herbst — Momiji",
    excerpt: "Die roten und goldenen Blätter im Arashiyama Bambuswald sind unbeschreiblich schön.",
    content: `Kyōto im November ist pure Magie. Die Momiji-Saison (Herbstlaubfärbung) ist in vollem Gange. Überall leuchten Rot-, Orange- und Goldtöne.

Der Arashiyama Bambuswald war schon früh morgens besucht — aber kurz nach 7 Uhr ist er fast menschenleer und komplett anders als auf den Fotos.`,
    date: "2025-11-15",
    location: "Kyōto, Arashiyama",
    lat: 35.0094,
    lng: 135.6761,
    season: "autumn",
    weather: "sunny",
    tags: ["Kyōto", "Herbst", "Momiji", "Arashiyama"],
    images: [],
    likes: 41,
  },
  {
    id: "3",
    slug: "hiroshima-miyajima",
    title: "Hiroshima & Miyajima — Geschichte und Stille",
    excerpt: "Das Peace Memorial hat mich mehr berührt als ich erwartet hatte.",
    content: `Hiroshima ist eine Stadt die einen nachdenken lässt. Das Peace Memorial Museum ist eines der eindringlichsten Museen das ich je besucht habe.

Danach mit der Fähre nach Miyajima — das schwimmende Torii-Tor bei Flut ist einfach ikonisch. Und die Rehe laufen einfach frei herum!`,
    date: "2025-11-20",
    location: "Hiroshima & Miyajima",
    lat: 34.3853,
    lng: 132.4553,
    season: "autumn",
    weather: "sunny",
    tags: ["Hiroshima", "Miyajima", "Geschichte"],
    images: [],
    likes: 35,
  },
];

export const BUCKET_LIST: BucketItem[] = [
  {
    id: "1",
    title: "Fuji-san besteigen",
    description: "Den höchsten Berg Japans beim Sonnenaufgang besteigen — Goraiko",
    location: "Mt. Fuji",
    lat: 35.3606,
    lng: 138.7274,
    done: false,
  },
  {
    id: "2",
    title: "Onsen in Hakone",
    description: "Mit Blick auf den Fuji in einem traditionellen Ryokan entspannen",
    location: "Hakone",
    lat: 35.2323,
    lng: 139.1069,
    done: true,
  },
  {
    id: "3",
    title: "Sapporo Schneefestival",
    description: "Das berühmte Yuki Matsuri im Februar",
    location: "Sapporo, Hokkaidō",
    lat: 43.0618,
    lng: 141.3545,
    done: false,
  },
  {
    id: "4",
    title: "Fushimi Inari bei Nacht",
    description: "Die 1000 Torii-Tore ohne Touristenmassen erleben",
    location: "Kyōto",
    lat: 34.9671,
    lng: 135.7727,
    done: true,
  },
  {
    id: "5",
    title: "Okinawa — Strand & Meer",
    description: "Tauchen im klarsten Wasser Japans",
    location: "Okinawa",
    lat: 26.5013,
    lng: 127.9454,
    done: false,
  },
];

export const STATS = {
  daysInJapan: 142,
  citiesVisited: 18,
  photosUploaded: 847,
  postsWritten: POSTS.length,
  kmTraveled: 4230,
};

export const SEASON_INFO: Record<Season, { label: string; color: string; emoji: string }> = {
  spring: { label: "Frühling", color: "#ff9ebc", emoji: "🌸" },
  summer: { label: "Sommer",  color: "#ffd166", emoji: "☀️" },
  autumn: { label: "Herbst",  color: "#ff6b35", emoji: "🍂" },
  winter: { label: "Winter",  color: "#a8d8ea", emoji: "❄️" },
};

export const WEATHER_INFO: Record<Weather, { label: string; emoji: string }> = {
  sunny:  { label: "Sonnig",    emoji: "☀️" },
  cloudy: { label: "Bewölkt",   emoji: "☁️" },
  rainy:  { label: "Regnerisch",emoji: "🌧️" },
  snowy:  { label: "Schnee",    emoji: "❄️" },
  foggy:  { label: "Neblig",    emoji: "🌫️" },
};
