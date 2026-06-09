import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import NipponDesktop from "./NipponDesktop";

const LAB_QUERY = groq`
  *[_type == "post"] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    lat,
    lng,
    excerpt,
    tags,
    youtubeId,
    "cover": photos[0].image.asset->url,
    "photos": photos[]{ "url": image.asset->url, caption }
  }
`;

export const metadata = { title: "NipponOS — Lab" };

export default async function LabPage() {
  let posts = [];
  try {
    posts = await client.fetch(LAB_QUERY, {}, { next: { revalidate: 30 } });
  } catch { posts = []; }
  return <NipponDesktop posts={posts ?? []} />;
}
