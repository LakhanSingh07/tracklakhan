import { useState } from "react";
import { User, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const BASE = "https://api.dicebear.com/9.x/adventurer/png";
const FEMALE_HAIR = [
  "long01","long02","long03","long04","long05","long06","long07",
  "long08","long09","long10","long11","long12","long13","long14",
  "long15","long16","long17","long18","long19","long20","long21",
  "long22","long23","long24","long25","long26",
].join(",");
const BG = "fce4ec,fdf2f8,f3e5f5,fff0f5";

export function getAvatarUrl(seed: string) {
  return `${BASE}?seed=${encodeURIComponent(seed)}&hair=${FEMALE_HAIR}&scale=85&backgroundColor=${BG}`;
}

const CURATED_SEEDS = [
  "priya-s", "maya-s", "ananya-s", "kavita-s",
  "meera-s", "sunita-s", "divya-s", "riya-s",
  "pooja-s", "lakshmi-s", "rashmi-s", "nisha-s",
];

export const AVATAR_OPTIONS = CURATED_SEEDS.map(getAvatarUrl);

interface CommunitySetupProps {
  defaultName: string;
  onSubmit: (nickname: string, avatarUrl: string) => Promise<void>;
}

export function CommunitySetup({ defaultName, onSubmit }: CommunitySetupProps) {
  const [nickname, setNickname] = useState(defaultName);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    try {
      await onSubmit(trimmed, selectedAvatar);
    } catch (err: any) {
      setError(err.message || "Failed to create community profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-12 px-5 pt-8 bg-gradient-to-br from-[#FFF0F5] to-[#F3E5F5] min-h-[calc(100svh-45px-34px)] flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br from-[#F06292] to-[#9C27B0] flex items-center justify-center shadow-md shadow-pink-200">
            <span className="text-3xl">🌸</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
            Join Saheli
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your circle of women who truly understand. Share, connect, and heal together.
          </p>
        </div>

        {/* Identity Preview Card */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-[#F8BBD0] flex items-center gap-4">
          <div className="relative">
            <img
              src={selectedAvatar}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-full border-2 border-[#F8BBD0] bg-pink-50 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#C2185B] rounded-full flex items-center justify-center border-2 border-white text-white text-[10px] font-bold">
              ✓
            </div>
          </div>
          <div>
            <h4 className={`text-base font-bold transition-colors ${nickname.trim() ? "text-gray-800" : "text-gray-300"}`}>
              {nickname.trim() || "Your Name"}
            </h4>
            <p className="text-xs text-gray-400">Saheli member</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
              Your Nickname
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-300">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={30}
                required
                className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 border-1.5 border-[#F8BBD0] focus:border-[#C2185B] focus:outline-none transition-all placeholder-gray-300"
                placeholder="e.g. CycleSister, MoonGlow..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[10px] text-gray-400">Anonymous posting is always available 🔒</span>
              <span className="text-[10px] text-gray-400">{nickname.length}/30</span>
            </div>
          </div>

          {/* Avatar Options Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
              Choose your avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`relative aspect-square rounded-full border-2.5 overflow-hidden transition-all bg-white flex items-center justify-center p-0.5 ${
                    selectedAvatar === url
                      ? "border-[#C2185B] shadow-md shadow-pink-100 scale-105"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar ${i}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {selectedAvatar === url && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#C2185B] rounded-full flex items-center justify-center border border-white text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="w-full relative overflow-hidden rounded-xl py-3.5 text-center text-sm font-bold text-white shadow-md active:scale-98 transition-all"
            style={{
              background: nickname.trim() ? "linear-gradient(135deg, #F06292, #9C27B0)" : "#D1D5DB",
              cursor: nickname.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
            ) : (
              "Join Saheli →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
