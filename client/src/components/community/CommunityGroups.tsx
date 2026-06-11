import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { CommunityGroup } from "@/pages/CommunityScreen";

interface CommunityGroupsProps {
  groups: CommunityGroup[];
  joinedGroupIds: Set<number>;
  onJoinGroup: (group: CommunityGroup) => void;
  onSelectGroup: (group: CommunityGroup) => void;
  onCreateGroup?: () => void;
}

export function CommunityGroups({
  groups,
  joinedGroupIds,
  onJoinGroup,
  onSelectGroup,
  onCreateGroup,
}: CommunityGroupsProps) {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filters = ["All", "Joined", "Popular", "New"];

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

  const getGroupColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("pcos") || n.includes("fertility")) return "#fce7f3";
    if (n.includes("pain") || n.includes("mood") || n.includes("mental")) return "#ede9fe";
    if (n.includes("pregnancy") || n.includes("track")) return "#eff6ff";
    return "#fdf2f8";
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    // Search query
    if (searchQuery.trim() && !g.name.toLowerCase().includes(searchQuery.toLowerCase()) && !g.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tab filter
    if (filter === "Joined" && !joinedGroupIds.has(g.id)) {
      return false;
    }
    return true;
  });

  // Sort groups based on filters
  let sortedGroups = [...filteredGroups];
  if (filter === "Popular") {
    sortedGroups.sort((a, b) => b.member_count - a.member_count);
  } else if (filter === "New") {
    sortedGroups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Find a group to show as featured (highest member count)
  const featuredGroup = groups.length > 0 ? [...groups].sort((a, b) => b.member_count - a.member_count)[0] : null;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
            <p className="text-xs text-gray-400 mt-0.5">Find your support community</p>
          </div>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
            >
              + Create Group
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
          <Search className="w-4 h-4 text-gray-300" />
          <input
            className="flex-1 text-sm text-gray-600 placeholder-gray-300 outline-none bg-transparent"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 shadow-sm border ${
                filter === f
                  ? "text-white border-transparent"
                  : "bg-white border-gray-100 text-gray-400"
              }`}
              style={filter === f ? { background: "linear-gradient(135deg, #e879f9, #8b5cf6)" } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Featured banner */}
      {featuredGroup && filter !== "Joined" && !searchQuery && (
        <div
          onClick={() => onSelectGroup(featuredGroup)}
          className="mx-4 mb-5 rounded-2xl p-4 shadow-sm overflow-hidden relative cursor-pointer active:scale-98 transition-transform border border-pink-50"
          style={{ background: "linear-gradient(135deg, #fce7f3, #ede9fe)" }}
        >
          <div className="absolute right-2 top-1 text-5xl opacity-20">{getGroupEmoji(featuredGroup.name)}</div>
          <p className="text-[9px] font-extrabold text-purple-600 tracking-wider mb-1">FEATURED GROUP</p>
          <p className="text-base font-bold text-gray-800 mb-0.5">{featuredGroup.name}</p>
          <p className="text-[10px] text-gray-500 mb-3">{featuredGroup.member_count} members · Active daily</p>
          <button
            className="px-5 py-2 rounded-full text-white text-xs font-bold shadow-sm"
            style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
          >
            Explore Group
          </button>
        </div>
      )}

      {/* Group list */}
      <div className="px-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">All Groups</p>
        <div className="flex flex-col gap-3">
          {sortedGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-50">
              <p className="text-sm text-gray-400">No groups found.</p>
            </div>
          ) : (
            sortedGroups.map((g) => {
              const joined = joinedGroupIds.has(g.id);
              return (
                <div
                  key={g.id}
                  onClick={() => onSelectGroup(g)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-start gap-3 cursor-pointer hover:border-pink-50 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                    style={{ background: getGroupColor(g.name) }}
                  >
                    {getGroupEmoji(g.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-800 truncate">{g.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onJoinGroup(g);
                        }}
                        className={`flex-shrink-0 text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm transition-all ${
                          joined
                            ? "border-purple-200 text-purple-600 bg-purple-50"
                            : "border-transparent text-white"
                        }`}
                        style={!joined ? { background: "linear-gradient(135deg, #e879f9, #8b5cf6)" } : {}}
                      >
                        {joined ? "Joined" : "Join"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-1">{g.member_count} members</p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{g.description}</p>
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
