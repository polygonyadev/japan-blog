export type Season = "spring" | "summer" | "autumn" | "winter";
export type Weather = "sunny" | "cloudy" | "rainy" | "snowy" | "foggy";

export interface Post {
  id?: string;
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  date: string;
  location?: string;
  lat?: number;
  lng?: number;
  season?: Season;
  weather?: Weather;
  tags?: string[];
  images?: string[];
  coverImage?: string;
  photos?: { url: string; caption?: string }[];
  youtubeId?: string;
  likes?: number;
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

export const POSTS: Post[] = [];

export const BUCKET_LIST: BucketItem[] = [];

export const STATS = {
  daysInJapan: 0,
  citiesVisited: 0,
  photosUploaded: 0,
  postsWritten: 0,
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
