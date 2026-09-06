import type { CollectionEntry } from "astro:content";

/**
 * A post is publishable when it isn't marked draft and its date isn't in
 * the future. Drafts stay visible in `npm run dev` so you can keep working
 * on them without deleting the file.
 *
 * A static site only knows what "now" is at build time, so a future-dated
 * post won't automatically appear the day it's dated. It goes live the
 * next time the site rebuilds after that date passes, unless you add a
 * scheduled GitHub Action to rebuild on a cadence.
 */
export function isPublished(post: CollectionEntry<"posts">): boolean {
  if (import.meta.env.DEV) return true;
  return !post.data.draft && post.data.date <= new Date();
}
