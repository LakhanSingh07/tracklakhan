import { ShieldCheck, Users } from "lucide-react";
import { ExpertPage } from "@/pages/CommunityScreen";

interface CommunityExpertsProps {
  pages: ExpertPage[];
  followedPageIds: Set<number>;
  onFollowPage: (page: ExpertPage) => void;
  onSelectPage?: (page: ExpertPage) => void;
  onCreatePage?: () => void;
}

export function CommunityExperts({
  pages,
  followedPageIds,
  onFollowPage,
  onSelectPage,
  onCreatePage,
}: CommunityExpertsProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Expert Q&A</h1>
            <p className="text-xs text-gray-400 mt-0.5">Verified answers from health professionals</p>
          </div>
          {onCreatePage && (
            <button
              onClick={onCreatePage}
              className="px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
            >
              + Create Page
            </button>
          )}
        </div>
      </div>

      {/* Expert cards */}
      <div className="px-4 flex flex-col gap-3">
        {pages.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 text-gray-400 text-xs">
            No expert pages loaded.
          </div>
        ) : (
          pages.map((expert) => {
            const followed = followedPageIds.has(expert.id);
            return (
              <div
                key={expert.id}
                onClick={() => onSelectPage?.(expert)}
                className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:border-purple-100 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] shadow-sm flex-shrink-0 text-2xl">
                    🩺
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{expert.name}</h3>
                      <span className="flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
                        <ShieldCheck className="w-2.5 h-2.5 inline" /> Verified
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-[#8B5CF6] mt-0.5">{expert.category}</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">{expert.bio}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {expert.follower_count} followers
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFollowPage(expert);
                        }}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition-all border ${
                          followed
                            ? "bg-purple-50 border-purple-200 text-purple-600"
                            : "border-transparent text-white"
                        }`}
                        style={!followed ? { background: "linear-gradient(135deg, #e879f9, #8b5cf6)" } : {}}
                      >
                        {followed ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
