import { useMemo, useState } from "react";
import { buttonVariantClass, cardClickableClass, pillClass } from "../lib/styles";

interface Post {
  title: string;
  description: string;
  href: string;
  tags: string[];
}

interface Props {
  posts: Post[];
}

export default function TagFilter({ posts }: Props) {
  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort(),
    [posts]
  );

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visiblePosts = activeTag
    ? posts.filter((post) => post.tags.includes(activeTag))
    : posts;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setActiveTag(null)} className={pillClass(activeTag === null)}>
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={pillClass(activeTag === tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-6 flex animate-[fade-in_0.2s_ease-out] flex-col gap-4" key={activeTag ?? "all"}>
        {visiblePosts.map((post) => (
          <a key={post.href} href={post.href} className={cardClickableClass}>
            <h3 className="text-base font-semibold text-fg">{post.title}</h3>
            <p className="mt-2 text-sm text-fg-muted">{post.description}</p>
          </a>
        ))}
        {visiblePosts.length === 0 && (
          <div className="rounded-card border border-dashed border-border p-6 text-center">
            <p className="text-sm text-fg-muted">No posts tagged "{activeTag}".</p>
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`mt-3 ${buttonVariantClass.secondary}`}
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
