import { getPosts } from "@/lib/fetchData";
import PostsClient from "./PostsClient";

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsClient posts={posts} />;
}
