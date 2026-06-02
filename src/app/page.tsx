import { getPosts, getBucketItems, getSiteSettings, getStats } from "@/lib/fetchData";
import HomeClient from "@/app/HomeClient";

export default async function Home() {
  const [posts, bucketItems, settings, stats] = await Promise.all([
    getPosts(), getBucketItems(), getSiteSettings(), getStats(),
  ]);
  return <HomeClient posts={posts} bucketItems={bucketItems} settings={settings} stats={stats} />;
}
