import { Shield, MessageCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { CommunityPost, ReactionType } from "@/pages/CommunityScreen";

interface CommunityPostCardProps {
  post: CommunityPost;
  isSaved: boolean;
  hasReacted: string | undefined;
  currentUserId: string;
  onSelect: () => void;
  onReact: (reaction: ReactionType) => void;
  onSave: () => void;
  onBlockUser: (userId: string) => void;
  onReport: (postId: number) => void;
}

export function CommunityPostCard({
  post,
  isSaved,
  hasReacted,
  currentUserId,
  onSelect,
  onReact,
  onSave,
  onBlockUser,
  onReport,
}: CommunityPostCardProps) {
  const parseContent = (content: string) => {
    let title = "";
    let body = content;
    const doubleNewlineIndex = content.indexOf("\n\n");
    if (doubleNewlineIndex !== -1) {
      title = content.substring(0, doubleNewlineIndex);
      body = content.substring(doubleNewlineIndex + 2);
    } else {
      const periodIndex = content.indexOf(". ");
      if (periodIndex !== -1 && periodIndex < 100) {
        title = content.substring(0, periodIndex + 1);
        body = content.substring(periodIndex + 2);
      } else {
        title = content.length > 50 ? content.substring(0, 50) + "..." : content;
        body = content;
      }
    }
    return { title, body };
  };

  const { title, body } = parseContent(post.content);
  const authorLetter = post.is_anonymous || !post.authorName ? "?" : post.authorName[0].toUpperCase();

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 cursor-pointer hover:border-pink-50 transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
          style={{ background: post.authorAvatarColor || "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
        >
          {authorLetter}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {post.is_anonymous ? "Anonymous" : post.authorName || "Saheli Member"}
        </span>
        <span className="mx-1 text-gray-200">·</span>
        {post.topic && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#fce7f3", color: "#db2777" }}>
            {post.topic}
          </span>
        )}
        <span className="ml-auto text-[10px] text-gray-300">
          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="flex items-start gap-2 mb-1">
        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#ede9fe", color: "#7c3aed" }}>
          {post.type.toUpperCase()}
        </span>
        {post.hasExpertReply && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5" style={{ background: "#ecfdf5", color: "#059669" }}>
            <Shield className="w-2.5 h-2.5 inline" /> Expert Verified
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{title}</p>
      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-3">{body}</p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
        {[
          { key: "same_here", label: "Same Here", emoji: "🤝" },
          { key: "helpful", label: "Helpful", emoji: "💡" },
          { key: "support", label: "Support", emoji: "💜" },
        ].map((r) => {
          const active = hasReacted === r.key;
          return (
            <button
              key={r.key}
              onClick={() => onReact(r.key as ReactionType)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                active
                  ? "bg-purple-50 border-purple-200 text-purple-600"
                  : "border-gray-100 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          );
        })}

        <button
          onClick={onSave}
          className={`ml-auto p-1.5 rounded-full border border-gray-100 hover:bg-gray-50 ${isSaved ? "text-purple-600 border-purple-200 bg-purple-50" : "text-gray-400"}`}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-50 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> {post.comment_count} replies
        </span>
        {post.user_id && post.user_id !== currentUserId && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onBlockUser(post.user_id!)}
              className="hover:text-red-500"
            >
              Block Author
            </button>
            <button
              onClick={() => onReport(post.id)}
              className="hover:text-red-500"
            >
              Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
