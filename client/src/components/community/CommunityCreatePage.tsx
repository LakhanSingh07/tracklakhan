import { useState } from "react";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Health", "Gynecologist", "Nutritionist", "Mental Health", "Fitness", "Lifestyle", "Official"];
const COLORS = ["#C2185B", "#9C27B0", "#E91E63", "#7B1FA2", "#F06292", "#AD1457", "#6A1B9A", "#D81B60"];
const CATEGORY_EMOJI: Record<string, string> = {
  Gynecologist: "👩‍⚕️",
  Nutritionist: "🥗",
  "Mental Health": "🧠",
  Official: "✅",
  Health: "💊",
  Fitness: "🏃‍♀️",
  Lifestyle: "✨",
};

interface CommunityCreatePageProps {
  onBack: () => void;
  onSubmit: (data: { name: string; bio: string; category: string; avatarColor: string }) => Promise<void>;
}

export function CommunityCreatePage({ onBack, onSubmit }: CommunityCreatePageProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("Health");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
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
        bio: bio.trim(),
        category,
        avatarColor: selectedColor,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create expert page. Please try again.");
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
          New Page
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
          {/* Preview Card */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-pink-50 shadow-sm mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}88)`,
              }}
            >
              {CATEGORY_EMOJI[category] ?? "📄"}
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800">
                {name.trim() || "Page Name"}
              </h4>
              <div className="inline-block px-2 py-0.5 mt-1 bg-pink-50 text-[#C2185B] text-[10px] font-bold rounded-lg border border-pink-100">
                {category}
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Page Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Page Name *
              </label>
              <input
                type="text"
                maxLength={60}
                required
                className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 border border-gray-200 focus:border-[#C2185B] focus:outline-none transition-all placeholder-gray-300"
                placeholder="e.g. Dr. Jane Smith OB-GYN"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Bio
              </label>
              <textarea
                maxLength={200}
                rows={3}
                className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 border border-gray-200 focus:border-[#C2185B] focus:outline-none transition-all placeholder-gray-300 resize-none"
                placeholder="Describe what clinical advice or wellness guides you will offer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Category Select Chips */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                Expert Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      category === c
                        ? "bg-[#9C27B0] border-[#9C27B0] text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span>{CATEGORY_EMOJI[c] ?? "📄"}</span>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Grid */}
            <div>
              <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                Select Theme Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className="w-9 h-9 rounded-full relative transition-all active:scale-95 flex items-center justify-center border-2 border-transparent"
                    style={{ backgroundColor: col }}
                  >
                    {selectedColor === col && (
                      <div className="w-5 h-5 rounded-full border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
