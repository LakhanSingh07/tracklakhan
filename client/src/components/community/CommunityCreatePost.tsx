import { useState } from "react";
import { ArrowLeft, Check, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { CommunityGroup } from "@/pages/CommunityScreen";

const POST_TYPES = [
  { key: "question", label: "Ask a Question", desc: "Get support from the community", emoji: "❓", color: "#ede9fe", textColor: "#7c3aed" },
  { key: "anonymous", label: "Post Anonymously", desc: "Share without showing your name", emoji: "🔒", color: "#fce7f3", textColor: "#db2777" },
  { key: "experience", label: "Share Experience", desc: "Tell your personal story", emoji: "💜", color: "#fdf4ff", textColor: "#a21caf" },
  { key: "poll", label: "Create Poll", desc: "Ask the community to vote", emoji: "📊", color: "#eff6ff", textColor: "#3b82f6" },
  { key: "expert", label: "Ask an Expert", desc: "Get a verified expert reply", emoji: "🩺", color: "#f0fdf4", textColor: "#16a34a" },
];

interface CommunityCreatePostProps {
  groups: CommunityGroup[];
  onPublish: (postData: {
    type: string;
    groupId: number;
    title: string;
    body: string;
    isAnonymous: boolean;
    triggerWarning: string | null;
  }) => void;
  onCancel: () => void;
}

export function CommunityCreatePost({
  groups,
  onPublish,
  onCancel,
}: CommunityCreatePostProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [triggerWarning, setTriggerWarning] = useState(false);
  const [triggerText, setTriggerText] = useState("");

  const handlePublish = () => {
    if (!selectedGroup) return;
    onPublish({
      type: selectedType || "question",
      groupId: selectedGroup.id,
      title: title.trim(),
      body: body.trim(),
      isAnonymous: isAnonymous,
      triggerWarning: triggerWarning ? (triggerText.trim() || "Sensitive Content") : null,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-4">
        <button
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              onCancel();
            }
          }}
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">
            {step === 1
              ? "What type of post?"
              : step === 2
              ? "Choose a topic"
              : step === 3
              ? "Write your post"
              : "Almost done!"}
          </p>
          <p className="text-[10px] text-gray-400">Step {step} of 4</p>
        </div>
        <button onClick={onCancel} className="text-xs font-semibold text-gray-400">Cancel</button>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%`, background: "linear-gradient(90deg, #e879f9, #8b5cf6)" }}
          />
        </div>
      </div>

      {/* Step 1: Post type */}
      {step === 1 && (
        <div className="px-4 pb-8 flex-1">
          <div className="flex flex-col gap-3">
            {POST_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setSelectedType(t.key);
                  if (t.key === "anonymous") {
                    setIsAnonymous(true);
                  }
                  setStep(2);
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm transition-all border-2 text-left ${
                  selectedType === t.key
                    ? "border-purple-300 bg-purple-50/20"
                    : "border-transparent bg-white hover:border-pink-50"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </div>
                {selectedType === t.key && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Topic / Group Selection */}
      {step === 2 && (
        <div className="px-4 pb-8 flex-1">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Select a support group for your post</p>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGroup(g);
                  setStep(3);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm border ${
                  selectedGroup?.id === g.id
                    ? "text-white border-transparent"
                    : "bg-white border-gray-100 text-gray-500 hover:border-pink-50"
                }`}
                style={selectedGroup?.id === g.id ? { background: "linear-gradient(135deg, #e879f9, #8b5cf6)" } : {}}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Write post */}
      {step === 3 && (
        <div className="px-4 pb-8 flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedGroup && (
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
              >
                {selectedGroup.name}
              </span>
            )}
            {isAnonymous && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-pink-100 text-pink-700">
                🔒 Anonymous Posting Active
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col flex-1">
            <input
              className="w-full text-sm font-semibold text-gray-800 placeholder-gray-300 outline-none mb-3 border-b border-gray-50 pb-3"
              placeholder="Give your post a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full text-sm text-gray-600 placeholder-gray-300 outline-none resize-none flex-1"
              placeholder="Share your question or experience here..."
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Post anonymously</p>
                  <p className="text-[10px] text-gray-400">Hide your profile nickname from this post</p>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className="w-11 h-6 rounded-full transition-all relative border border-gray-100"
                style={{
                  background: isAnonymous ? "linear-gradient(135deg, #e879f9, #8b5cf6)" : "#e5e7eb",
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                  style={{ left: isAnonymous ? "22px" : "2px" }}
                />
              </button>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Add trigger warning</p>
                    <p className="text-[10px] text-gray-400">For highly sensitive topics</p>
                  </div>
                </div>
                <button
                  onClick={() => setTriggerWarning(!triggerWarning)}
                  className="w-11 h-6 rounded-full transition-all relative border border-gray-100"
                  style={{
                    background: triggerWarning ? "linear-gradient(135deg, #e879f9, #8b5cf6)" : "#e5e7eb",
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: triggerWarning ? "22px" : "2px" }}
                  />
                </button>
              </div>
              {triggerWarning && (
                <input
                  value={triggerText}
                  onChange={(e) => setTriggerText(e.target.value)}
                  placeholder="e.g. Pain description, miscarriage support"
                  className="w-full text-xs bg-gray-50 rounded-xl px-3 py-2 outline-none border border-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Safety check */}
      {step === 4 && (
        <div className="px-4 pb-8 flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-xl flex-shrink-0">🩺</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Before you post</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This community is for support and sharing stories. It does not replace medical advice. If you are experiencing severe symptoms (e.g. unbearable pain, heavy bleeding, fever, fainting), consult a doctor immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Your post preview</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}>
                  {selectedGroup?.name}
                </span>
                {isAnonymous && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-100 text-pink-700">
                    🔒 Anonymous
                  </span>
                )}
                {triggerWarning && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                    ⚠️ {triggerText.trim() || "Sensitive Content"}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">{title || "Untitled Post"}</p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{body || "No content written..."}</p>
            </div>
          </div>

          <button
            onClick={handlePublish}
            className="w-full py-4 mt-6 rounded-2xl text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-98 transition-all"
            style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
          >
            Publish Post
          </button>
        </div>
      )}

      {/* Continuation Button (for steps 1, 2, 3) */}
      {step < 4 && (
        <div className="px-4 mt-auto">
          <button
            disabled={
              (step === 1 && !selectedType) ||
              (step === 2 && !selectedGroup) ||
              (step === 3 && (!title.trim() || !body.trim()))
            }
            onClick={() => setStep(step + 1)}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg disabled:opacity-40 transition-opacity active:scale-98"
            style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
          >
            {step === 3 ? "Review Post" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
