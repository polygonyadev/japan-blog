import { getCommunity } from "@/lib/fetchData";
import CommunityClient from "./CommunityClient";

export default async function CommunityPage() {
  const posts = await getCommunity();
  return <CommunityClient initialPosts={posts} />;
}
