import { getBucketItems } from "@/lib/fetchData";
import BucketListClient from "./BucketListClient";

export default async function BucketListPage() {
  const items = await getBucketItems();
  return <BucketListClient initialItems={items} />;
}
