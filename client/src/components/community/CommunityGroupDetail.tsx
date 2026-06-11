import { ArrowLeft, Edit3, Loader2 } from "lucide-react";
import { CommunityPost, CommunityGroup, ReactionType } from "@/pages/CommunityScreen";
import { CommunityPostCard } from "./CommunityPostCard";

interface CommunityGroupDetailProps {
  group: CommunityGroup;
  posts: CommunityPost[];
  joinedGroupIds: Set<number>;
  savedPostIds: Set<number>;
  userReactions: Map<number, string>;
  currentUserId: string;
  onBack: () => void;
  onJoinGroup: (group: CommunityGroup) => void;
  onSelectPost: (post: CommunityPost) => void;
  onReact: (post: CommunityPost, reaction: ReactionType) => void;
  onSave: (post: CommunityPost) => void;
  onBlockUser: (userId: string) => void;
  onReportPost: (postId: number) => void;
  onOpenComposer: (group?: CommunityGroup, type?: string) => void;
}

export function CommunityGroupDetail({
  group,
  posts,
  joinedGroupIds,
  savedPostIds,
  userReactions,
  currentUserId,
  onBack,
  onJoinGroup,
  onSelectPost,
  onReact,
  onSave,
  onBlockUser,
  onReportPost,
  onOpenComposer,
}: CommunityGroupDetailProps) {
  const isJoined = joinedGroupIds.has(group.id);

  // Filter posts that belong to this group
  const groupPosts = posts.filter((p) => p.group_id === group.id);

  return (
    <div className="flex-1 flex flex-col h-[calc(100svh-45px-34px)] bg-[#FDFBFD] overflow-y-auto pb-12">
      {/* Banner / Header */}
      <div
        className="px-5 pt-4 pb-6 text-white relative flex flex-col justify-end min-h-[180px]"
        style={{
          background: `linear-gradient(135deg, ${group.avatar_color}, ${group.avatar_color}88)`,
        }}
      >
        <button onClick={onBack} className="absolute top-4 left-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-3 mt-8">
          {group.name.charAt(0).toUpperCase()}
        </div>

        <h2 className="text-xl font-bold" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
          {group.name}
        </h2>

        <div className="flex items-center gap-3 text-xs opacity-90 mt-1">
          <span>👥 {group.member_count} members</span>
          {group.type === "private" && <span>🔒 Private</span>}
        </div>

        <p className="text-xs opacity-80 mt-2 leading-relaxed max-w-md">
          {group.description || "No description provided."}
        </p>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={() => onJoinGroup(group)}
            className="px-5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: isJoined ? "rgba(255, 255, 255, 0.2)" : "#ffffff",
              color: isJoined ? "#ffffff" : group.avatar_color,
              border: isJoined ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
            }}
          >
            {isJoined ? "✓ Joined" : "Join Group"}
          </button>

          {isJoined && (
            <button
              onClick={() => onOpenComposer(group)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 border border-white/40 text-white text-xs font-bold hover:bg-white/30 transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Post here
            </button>
          )}
        </div>
      </div>

      {/* Feed Area */}
      <div className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Group Posts</p>
        <div className="flex flex-col gap-3">
          {groupPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-50 shadow-sm">
              <span className="text-3xl block mb-2">💬</span>
              <h5 className="text-sm font-semibold text-gray-700">No posts yet</h5>
              <p className="text-xs text-gray-400 mt-1">
                {isJoined ? "Be the first to post in this group!" : "Join this group to participate and share posts."}
              </p>
            </div>
          ) : (
            groupPosts.map((post) => (
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
