import { useState } from "react";
import { Search, Bell, Lock, MessageCircle, Bookmark, BookmarkCheck, Shield, Sparkles, Send } from "lucide-react";
import { motion } from "framer-motion";
import { CommunityPost, CommunityGroup, ReactionType } from "@/pages/CommunityScreen";

const TOPICS = ["Period Pain", "PCOS Support", "Irregular Periods", "PMS & Mood", "Pregnancy", "Teen Health"];

interface CommunityHomeProps {
  posts: CommunityPost[];
  groups: CommunityGroup[];
  joinedGroupIds: Set<number>;
  savedPostIds: Set<number>;
  userReactions: Map<number, string>;
  displayName: string;
  onSelectPost: (post: CommunityPost) => void;
  onSelectGroup: (group: CommunityGroup) => void;
  onJoinGroup: (group: CommunityGroup) => void;
  onReact: (post: CommunityPost, reaction: ReactionType) => void;
  onSave: (post: CommunityPost) => void;
  onOpenComposer: (group?: CommunityGroup, type?: string) => void;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  onBlockUser: (userId: string) => void;
  onReportPost: (postId: number) => void;
  currentUserId: string;
}

export function CommunityHome({
  posts,
  groups,
  joinedGroupIds,
  savedPostIds,
  userReactions,
  displayName,
  onSelectPost,
  onSelectGroup,
  onJoinGroup,
  onReact,
  onSave,
  onOpenComposer,
  activeTab,
  setActiveTab,
  onBlockUser,
  onReportPost,
  currentUserId,
}: CommunityHomeProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getGroupEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("pcos")) return "🌸";
    if (n.includes("pain") || n.includes("cramp")) return "💜";
    if (n.includes("fertility") || n.includes("conceive")) return "🌷";
    if (n.includes("mental") || n.includes("wellness") || n.includes("mood")) return "🌙";
    if (n.includes("thyroid") || n.includes("hormone")) return "🦋";
    if (n.includes("pregnancy") || n.includes("postpartum") || n.includes("mom")) return "🤍";
    if (n.includes("track")) return "📊";
    if (n.includes("nutrition") || n.includes("food")) return "🥗";
    if (n.includes("body") || n.includes("love")) return "✨";
    if (n.includes("teen")) return "✨";
    if (n.includes("perimenopause") || n.includes("menopause")) return "🍂";
    return "🎀";
  };

  const getGroupGradient = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("pcos") || n.includes("fertility")) return "from-pink-100 to-rose-100";
    if (n.includes("pain") || n.includes("mood") || n.includes("mental")) return "from-purple-100 to-violet-100";
    if (n.includes("pregnancy") || n.includes("track")) return "from-blue-100 to-indigo-100";
    return "from-pink-100 to-rose-100";
  };

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

  const filteredPosts = posts.filter((post) => {
    // If activeTab is Saved, only show saved posts
    if (activeTab === "Saved" && !savedPostIds.has(post.id)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(q) ||
        (post.topic && post.topic.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Community</h1>
            <p className="text-xs text-gray-400 mt-0.5">A safe space for every phase</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center relative border border-gray-100">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">3</span>
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
            >
              {displayName ? displayName[0].toUpperCase() : "S"}
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      {searchOpen && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-pink-100">
            <Search className="w-4 h-4 text-gray-300" />
            <input
              className="flex-1 text-sm text-gray-600 placeholder-gray-300 outline-none bg-transparent"
              placeholder="Search conversations, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Ask anonymously card */}
      <div className="mx-4 mb-4 rounded-2xl p-4 shadow-sm" style={{ background: "linear-gradient(135deg, #fce7f3, #ede9fe)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-lg shadow-sm">🔒</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Ask anonymously</p>
            <p className="text-xs text-gray-400">Have a sensitive question?</p>
          </div>
          <button
            onClick={() => onOpenComposer(undefined, "anonymous")}
            className="px-4 py-2 rounded-full text-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
          >
            Ask Now
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: "❓", label: "Ask Anon", action: () => onOpenComposer(undefined, "anonymous") },
            { icon: "👥", label: "Groups", action: () => setActiveTab("Groups") },
            { icon: "🩺", label: "Expert Q&A", action: () => setActiveTab("Experts") },
            { icon: "📝", label: "My Posts", action: () => {
              setSearchOpen(true);
              setSearchQuery(displayName);
            }},
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex flex-col items-center gap-1.5 bg-white rounded-2xl py-3 shadow-sm border border-gray-50/50 active:scale-95 transition-transform"
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-[10px] text-gray-500 font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Groups strip */}
      {activeTab !== "Saved" && (
        <div className="mb-4 mt-3">
          <div className="px-4 flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Recommended Groups</p>
            <button onClick={() => setActiveTab("Groups")} className="text-xs font-medium" style={{ color: "#a855f7" }}>See all</button>
          </div>
          <div className="flex gap-3 pl-4 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {groups.slice(0, 5).map((g) => {
              const joined = joinedGroupIds.has(g.id);
              return (
                <div
                  key={g.id}
                  className={`flex-shrink-0 w-28 rounded-2xl p-3 bg-gradient-to-br ${getGroupGradient(g.name)} shadow-sm cursor-pointer`}
                  onClick={() => onSelectGroup(g)}
                >
                  <div className="text-2xl mb-1">{getGroupEmoji(g.name)}</div>
                  <p className="text-xs font-semibold text-gray-700 leading-tight truncate">{g.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{g.member_count} members</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoinGroup(g);
                    }}
                    className="mt-2 w-full py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                    style={{ background: joined ? "linear-gradient(135deg, #9ca3af, #6b7280)" : "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
                  >
                    {joined ? "Joined" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feed List */}
      <div className="px-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">{activeTab === "Saved" ? "Saved Posts" : "For You"}</p>
        <div className="flex flex-col gap-3">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-50">
              <p className="text-sm text-gray-400">No posts found in this feed.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const { title, body } = parseContent(post.content);
              const hasReacted = userReactions.get(post.id);
              const isSaved = savedPostIds.has(post.id);
              const authorLetter = post.is_anonymous || !post.authorName ? "?" : post.authorName[0].toUpperCase();

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
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
                          onClick={() => onReact(post, r.key as ReactionType)}
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
                      onClick={() => onSave(post)}
                      className={`ml-auto p-1.5 rounded-full border border-gray-100 hover:bg-gray-50 ${isSaved ? "text-purple-600 border-purple-200 bg-purple-50" : "text-gray-400"}`}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-50 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comment_count} replies
                    </span>
                    {post.user_id !== currentUserId && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockUser(post.user_id!);
                          }}
                          className="hover:text-red-500"
                        >
                          Block Author
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReportPost(post.id);
                          }}
                          className="hover:text-red-500"
                        >
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
