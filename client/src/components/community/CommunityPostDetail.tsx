import { useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, MessageCircle, Send, Shield, ShieldCheck, Flag, Trash2 } from "lucide-react";
import { CommunityPost, CommunityComment, ReactionType } from "@/pages/CommunityScreen";

interface CommunityPostDetailProps {
  post: CommunityPost;
  comments: CommunityComment[];
  savedPostIds: Set<number>;
  userReactions: Map<number, string>;
  onBack: () => void;
  onReact: (post: CommunityPost, reaction: ReactionType) => void;
  onSave: (post: CommunityPost) => void;
  onAddComment: (commentText: string, isAnon: boolean) => void;
  currentUserId: string;
  onDeletePost?: (postId: number) => void;
  onDeleteComment?: (commentId: number) => void;
  onReportComment?: (commentId: number) => void;
}

export function CommunityPostDetail({
  post,
  comments,
  savedPostIds,
  userReactions,
  onBack,
  onReact,
  onSave,
  onAddComment,
  currentUserId,
  onDeletePost,
  onDeleteComment,
  onReportComment,
}: CommunityPostDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [isAnonComment, setIsAnonComment] = useState(false);
  const [sort, setSort] = useState("Expert First");
  const [helpfulComments, setHelpfulComments] = useState<Record<number, number>>({});
  const [clickedHelpful, setClickedHelpful] = useState<Record<number, boolean>>({});

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim(), isAnonComment);
    setCommentText("");
  };

  const handleHelpfulClick = (commentId: number) => {
    if (clickedHelpful[commentId]) {
      // Toggle off
      setHelpfulComments(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) - 1 }));
      setClickedHelpful(prev => ({ ...prev, [commentId]: false }));
    } else {
      // Toggle on
      setHelpfulComments(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
      setClickedHelpful(prev => ({ ...prev, [commentId]: true }));
    }
  };

  // Parse Title and Body from post content
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
  const hasReacted = userReactions.get(post.id);
  const isSaved = savedPostIds.has(post.id);

  // Sorting logic for comments
  const sortedComments = [...comments];
  if (sort === "Latest") {
    sortedComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "Most Helpful") {
    // Sort by helpful votes (local votes + default baseline)
    const getHelpfulScore = (c: CommunityComment) => {
      const baseline = (c.id % 7) * 4 + 3; // Stable mock baseline
      return baseline + (helpfulComments[c.id] || 0);
    };
    sortedComments.sort((a, b) => getHelpfulScore(b) - getHelpfulScore(a));
  } else {
    // Expert First, then default chronological
    sortedComments.sort((a, b) => {
      if (a.isExpert && !b.isExpert) return -1;
      if (!a.isExpert && b.isExpert) return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-3 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="text-center flex-1">
          <p className="text-sm font-semibold text-gray-800">Post details</p>
        </div>
        {post.user_id === currentUserId && onDeletePost ? (
          <button
            onClick={() => onDeletePost(post.id)}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500 border border-gray-100 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>

      {/* Main post scroll area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36">
        {/* Post card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
              style={{ background: post.authorAvatarColor || "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
            >
              {post.is_anonymous || !post.authorName ? "?" : post.authorName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {post.is_anonymous ? "Anonymous" : post.authorName || "Saheli Member"}
              </p>
              <p className="text-[10px] text-gray-400">
                {post.groupName || "Community"} · {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded font-bold" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                {post.type.toUpperCase()}
              </span>
              <button
                onClick={() => onSave(post)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isSaved ? "bg-purple-50 border-purple-200 text-purple-600" : "bg-gray-50 border-gray-100 text-gray-400"
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-base font-bold text-gray-800 mb-2 leading-snug">{title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{body}</p>

          {/* Safety disclaimer */}
          <div className="rounded-xl p-3 mb-4 text-[10px] text-gray-400 leading-relaxed bg-pink-50/20 border border-pink-50/50">
            💡 This community is for support and shared experiences. It does not replace medical advice.
          </div>

          {/* Reactions list */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { key: "same_here", label: "Same Here", emoji: "🤝" },
              { key: "helpful", label: "Helpful", emoji: "💡" },
              { key: "support", label: "Support", emoji: "💜" },
              { key: "thank_you", label: "Thank You", emoji: "🙏" },
            ].map((r) => {
              const active = hasReacted === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => onReact(post, r.key as ReactionType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                    active ? "border-purple-300 text-purple-600 bg-purple-50" : "border-gray-100 text-gray-500 bg-gray-50"
                  }`}
                >
                  {r.emoji} {r.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-50 text-[10px] text-gray-400">
            <span>{post.comment_count} comments {post.hasExpertReply ? "· Expert Verified" : ""}</span>
          </div>
        </div>

        {/* Comment list header & sort filters */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <p className="text-sm font-semibold text-gray-700">Comments ({comments.length})</p>
          <div className="flex gap-1">
            {["Most Helpful", "Latest", "Expert First"].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm border transition-all ${
                  sort === s ? "text-white border-transparent" : "bg-white border-gray-100 text-gray-400"
                }`}
                style={sort === s ? { background: "linear-gradient(135deg, #e879f9, #8b5cf6)" } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Comment items */}
        <div className="flex flex-col gap-3">
          {sortedComments.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 text-gray-400 text-xs">
              No replies yet. Be the first to share support!
            </div>
          ) : (
            sortedComments.map((c) => {
              const isOwnComment = c.user_id === currentUserId;
              const hasLiked = clickedHelpful[c.id];
              const votes = ((c.id % 7) * 4 + 3) + (helpfulComments[c.id] || 0);

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl p-4 shadow-sm border ${
                    c.isExpert ? "border-purple-200" : "bg-white border-gray-100"
                  }`}
                  style={c.isExpert ? { background: "linear-gradient(135deg, #fdf2f8, #f5f0ff)" } : {}}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                      style={{
                        background: c.isExpert
                          ? "linear-gradient(135deg, #8b5cf6, #4f46e5)"
                          : c.authorAvatarColor || "linear-gradient(135deg, #e879f9, #8b5cf6)",
                      }}
                    >
                      {c.is_anonymous || !c.authorName ? "?" : c.authorName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-800">
                          {c.is_anonymous ? "Anonymous" : c.authorName || "Saheli Member"}
                        </span>
                        {c.isExpert && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            <ShieldCheck className="w-2.5 h-2.5 inline" /> {c.role || "Verified Expert"}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-300 ml-auto shrink-0">
                          {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2.5 whitespace-pre-wrap">{c.body}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-50/50">
                    <button
                      onClick={() => handleHelpfulClick(c.id)}
                      className={`flex items-center gap-1 text-[10px] font-medium border px-2 py-0.5 rounded-full transition-colors ${
                        hasLiked ? "text-purple-600 border-purple-200 bg-purple-50" : "text-gray-400 border-gray-100"
                      }`}
                    >
                      <span>💡</span> Helpful · {votes}
                    </button>

                    <div className="flex gap-2">
                      {isOwnComment && onDeleteComment && (
                        <button
                          onClick={() => onDeleteComment(c.id)}
                          className="text-[10px] text-gray-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      )}
                      {!isOwnComment && onReportComment && (
                        <button
                          onClick={() => onReportComment(c.id)}
                          className="text-[10px] text-gray-400 hover:text-red-500"
                        >
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reply input tray */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 shadow-lg z-30" style={{ maxWidth: 390, margin: "0 auto" }}>
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2 border border-gray-100">
          <input
            className="flex-1 text-xs text-gray-600 placeholder-gray-300 outline-none bg-transparent py-1"
            placeholder="Add a kind comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendComment();
            }}
          />
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white disabled:opacity-40 shadow-sm"
            style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setIsAnonComment(!isAnonComment)}
            className={`flex items-center gap-1 text-[9px] font-semibold border rounded-full px-2.5 py-1 transition-colors ${
              isAnonComment ? "border-purple-200 text-purple-600 bg-purple-50" : "border-gray-100 text-gray-400"
            }`}
          >
            🔒 Post anonymously
          </button>
        </div>
      </div>
    </div>
  );
}
