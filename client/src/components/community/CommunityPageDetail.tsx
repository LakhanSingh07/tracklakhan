import { ArrowLeft } from "lucide-react";
import { CommunityPost, ExpertPage, ReactionType } from "@/pages/CommunityScreen";
import { CommunityPostCard } from "./CommunityPostCard";

const CATEGORY_EMOJI: Record<string, string> = {
  Gynecologist: "👩‍⚕️",
  Nutritionist: "🥗",
  "Mental Health": "🧠",
  Official: "✅",
  Health: "💊",
  Fitness: "🏃‍♀️",
  Lifestyle: "✨",
};

interface CommunityPageDetailProps {
  page: ExpertPage;
  posts: CommunityPost[];
  followedPageIds: Set<number>;
  savedPostIds: Set<number>;
  userReactions: Map<number, string>;
  currentUserId: string;
  onBack: () => void;
  onFollowPage: (page: ExpertPage) => void;
  onSelectPost: (post: CommunityPost) => void;
  onReact: (post: CommunityPost, reaction: ReactionType) => void;
  onSave: (post: CommunityPost) => void;
  onBlockUser: (userId: string) => void;
  onReportPost: (postId: number) => void;
}

export function CommunityPageDetail({
  page,
  posts,
  followedPageIds,
  savedPostIds,
  userReactions,
  currentUserId,
  onBack,
  onFollowPage,
  onSelectPost,
  onReact,
  onSave,
  onBlockUser,
  onReportPost,
}: CommunityPageDetailProps) {
  const isFollowing = followedPageIds.has(page.id);

  // Filter posts that belong to this page/author
  const pagePosts = posts.filter((p) => p.page_id === page.id);

  return (
    <div className="flex-1 flex flex-col h-[calc(100svh-45px-34px)] bg-[#FDFBFD] overflow-y-auto pb-12">
      {/* Banner / Header */}
      <div
        className="px-5 pt-4 pb-6 text-white relative flex flex-col justify-end min-h-[190px]"
        style={{
          background: `linear-gradient(135deg, ${page.avatar_color}, ${page.avatar_color}88)`,
        }}
      >
        <button onClick={onBack} className="absolute top-4 left-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3 mt-8">
          {CATEGORY_EMOJI[page.category] ?? "📄"}
        </div>

        <h2 className="text-xl font-bold" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
          {page.name}
        </h2>

        <div className="inline-block px-2.5 py-0.5 mt-1 bg-white/20 border border-white/20 text-[10px] font-bold rounded-lg text-white align-self-start max-w-fit">
          {page.category}
        </div>

        <p className="text-xs opacity-80 mt-2 leading-relaxed max-w-md">
          {page.bio || "No biography provided."}
        </p>

        <div className="text-xs opacity-75 mt-2">
          {page.follower_count} followers
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={() => onFollowPage(page)}
            className="px-5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: isFollowing ? "rgba(255, 255, 255, 0.2)" : "#ffffff",
              color: isFollowing ? "#ffffff" : page.avatar_color,
              border: isFollowing ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
            }}
          >
            {isFollowing ? "✓ Following" : "Follow Page"}
          </button>
        </div>
      </div>

      {/* Feed Area */}
      <div className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Posts from this page</p>
        <div className="flex flex-col gap-3">
          {pagePosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-50 shadow-sm">
              <span className="text-3xl block mb-2">📄</span>
              <h5 className="text-sm font-semibold text-gray-700">No posts yet</h5>
              <p className="text-xs text-gray-400 mt-1">
                This page has not published any posts yet.
              </p>
            </div>
          ) : (
            pagePosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                isSaved={savedPostIds.has(post.id)}
                hasReacted={userReactions.get(post.id)}
                currentUserId={currentUserId}
                onSelect={() => onSelectPost(post)}
                onReact={(reaction) => onReact(post, reaction)}
                onSave={() => onSave(post)}
                onBlockUser={onBlockUser}
                onReport={onReportPost}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
