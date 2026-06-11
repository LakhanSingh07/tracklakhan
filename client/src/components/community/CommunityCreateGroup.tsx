import { useState } from "react";
import { ArrowLeft, Loader2, Globe, Lock } from "lucide-react";

const COLORS = ["#C2185B", "#9C27B0", "#E91E63", "#7B1FA2", "#F06292", "#AD1457", "#6A1B9A", "#D81B60"];

interface CommunityCreateGroupProps {
  onBack: () => void;
  onSubmit: (data: { name: string; description: string; avatarColor: string; type: string }) => Promise<void>;
}

export function CommunityCreateGroup({ onBack, onSubmit }: CommunityCreateGroupProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [type, setType] = useState<"public" | "private">("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        avatarColor: selectedColor,
        type,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100svh-45px-34px)] bg-[#FDFBFD]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#FFF0F5] to-[#F9E4F0] border-b border-pink-100">
        <button onClick={onBack} className="text-gray-600 text-sm font-semibold hover:text-[#C2185B]">
          Cancel
        </button>
        <span className="text-base font-bold text-gray-800" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
          New Group
        </span>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || submitting}
          className="px-4 py-1.5 rounded-full text-white text-xs font-bold shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
          style={{
            background: name.trim() ? "linear-gradient(135deg, #F06292, #9C27B0)" : "#D1D5DB",
            cursor: name.trim() && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-md mx-auto">
          {/* Preview Row */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-pink-50 shadow-sm mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}88)`,
              }}
            >
              {name.trim().charAt(0).toUpperCase() || "G"}
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800">
                {name.trim() || "Group Name"}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {type === "public" ? "🌐 Public" : "🔒 Private"} · 1 member
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Group Name *
              </label>
              <input
                type="text"
                maxLength={50}
                required
                className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 border border-gray-200 focus:border-[#C2185B] focus:outline-none transition-all placeholder-gray-300"
                placeholder="e.g. PCOS Warriors, Yoga Healing..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Description
              </label>
              <textarea
                maxLength={200}
                rows={3}
                className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 border border-gray-200 focus:border-[#C2185B] focus:outline-none transition-all placeholder-gray-300 resize-none"
                placeholder="What is this group about? Share guidelines or goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Colors Grid */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                Select Theme Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className="w-9 h-9 rounded-full relative transition-all active:scale-95 flex items-center justify-center border-2 border-transparent"
                    style={{ backgroundColor: c }}
                  >
                    {selectedColor === c && (
                      <div className="w-5 h-5 rounded-full border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Select */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                Privacy Options
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("public")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 border text-sm font-semibold transition-all ${
                    type === "public"
                      ? "bg-[#C2185B] border-[#C2185B] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  🌐 Public
                </button>
                <button
                  type="button"
                  onClick={() => setType("private")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 border text-sm font-semibold transition-all ${
                    type === "private"
                      ? "bg-[#C2185B] border-[#C2185B] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  🔒 Private
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
