import { getPosts, getBucketItems } from "@/lib/fetchData";
import MapPageClient from "./MapPageClient";

export default async function MapPage() {
  const [posts, bucketItems] = await Promise.all([getPosts(), getBucketItems()]);
  return <MapPageClient posts={posts} bucketItems={bucketItems} />;
}
