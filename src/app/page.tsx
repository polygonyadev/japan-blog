import { getPosts, getBucketItems, getSiteSettings, getStats } from "@/lib/fetchData";
import EntryGate from "@/app/EntryGate";

export default async function Home() {
  const [posts, bucketItems, settings, stats] = await Promise.all([
    getPosts(), getBucketItems(), getSiteSettings(), getStats(),
  ]);
  return <EntryGate posts={posts} bucketItems={bucketItems} settings={settings} stats={stats} />;
}
