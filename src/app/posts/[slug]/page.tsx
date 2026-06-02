import { notFound } from "next/navigation";
import { MapPin, Calendar } from "lucide-react";
import { getPostBySlug, getPosts } from "@/lib/fetchData";
import Comments from "@/components/Comments";
import { SEASON_INFO, WEATHER_INFO } from "@/lib/data";
import LikeButton from "@/components/LikeButton";
import PostContent from "@/components/PostContent";
import { BackLinkTop, BackLinkBottom } from "@/components/BackLink";
import PostHeroImage from "@/components/PostHeroImage";
import PostPhotos from "@/components/PostPhotos";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const season = post.season ? SEASON_INFO[post.season] : null;
  const weather = post.weather ? WEATHER_INFO[post.weather] : null;

  return (
    <div className="min-h-screen pt-14">
      {/* Cover image — erstes Foto, klickbar */}
      {post.photos?.[0]?.url && (
        <PostHeroImage url={post.photos[0].url} title={post.title} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <BackLinkTop />

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {season && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${season.color}22`, color: season.color, border: `1px solid ${season.color}44` }}>
              {season.emoji} {season.label}
            </span>
          )}
          {weather && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {weather.emoji} {weather.label}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          {post.date && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Calendar size={13} />
              {new Date(post.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <MapPin size={13} style={{ color: "var(--accent-pink)" }} />
              {post.location}
            </div>
          )}
          <div className="ml-auto">
            <LikeButton postId={post.id ?? post.slug} initialLikes={post.likes ?? 0} />
          </div>
        </div>

        {/* Content — DE/EN */}
        <PostContent
          content={post.content}
          contentEN={post.contentEN}
          excerpt={post.excerpt}
          excerptEN={post.excerptEN}
        />

        {/* Photo gallery with lightbox */}
        <PostPhotos photos={post.photos ?? []} />

        {/* YouTube */}
        {post.youtubeId && (
          <div className="mt-8">
            <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%", border: "1px solid var(--border)" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${post.youtubeId}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "rgba(0,212,255,0.08)", color: "var(--accent-cyan)", border: "1px solid rgba(0,212,255,0.2)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <Comments />

        {/* Navigation */}
        <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <BackLinkBottom />
        </div>
      </div>
    </div>
  );
}
