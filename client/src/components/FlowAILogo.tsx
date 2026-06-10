interface FlowAILogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "icon-white";
  className?: string;
}

const SIZES = {
  sm: { icon: 32, fontSize: 18, sub: 9 },
  md: { icon: 52, fontSize: 26, sub: 11 },
  lg: { icon: 80, fontSize: 36, sub: 13 },
  xl: { icon: 110, fontSize: 48, sub: 15 },
};

export const FlowAIIcon = ({ size = 60, white = false }: { size?: number; white?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="drop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={white ? "#fff" : "#8B5CF6"} />
        <stop offset="100%" stopColor={white ? "rgba(255,255,255,0.7)" : "#EC4899"} />
      </linearGradient>
      <linearGradient id="drop-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#F472B6"  />
      </linearGradient>
    </defs>

    {/* Outer circle background */}
    <circle cx="30" cy="30" r="29" fill={white ? "rgba(255,255,255,0.15)" : "url(#drop-grad)"} />

    {/* Wave / flow shape inside */}
    <path
      d="M12 30 Q18 20 24 28 Q30 36 36 26 Q42 16 50 24"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M10 36 Q16 26 22 34 Q28 42 34 32 Q40 22 48 30"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.35"
    />

    {/* AI sparkle — 4-point star */}
    <path
      d="M30 13 L31.8 19.5 L38.5 21 L31.8 22.5 L30 29 L28.2 22.5 L21.5 21 L28.2 19.5 Z"
      fill="white"
      opacity="0.95"
    />

    {/* Small accent dots */}
    <circle cx="20" cy="40" r="2.2" fill="white" opacity="0.55" />
    <circle cx="30" cy="44" r="1.8" fill="white" opacity="0.4" />
    <circle cx="40" cy="40" r="2.2" fill="white" opacity="0.55" />
  </svg>
);

export const FlowAILogo = ({ size = "md", variant = "full", className = "" }: FlowAILogoProps) => {
  const s = SIZES[size];

  if (variant === "icon") {
    return <FlowAIIcon size={s.icon} />;
  }

  if (variant === "icon-white") {
    return <FlowAIIcon size={s.icon} white />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <FlowAIIcon size={s.icon} />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5 leading-none">
          <span
            className="font-bold"
            style={{
              fontSize: s.fontSize,
              fontFamily: "Instrument Sans, sans-serif",
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            Flow
          </span>
          <span
            className="font-extrabold"
            style={{
              fontSize: s.fontSize,
              fontFamily: "Instrument Sans, sans-serif",
              background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            AI
          </span>
        </div>
        <span
          className="font-semibold tracking-widest uppercase text-gray-400 mt-0.5"
          style={{ fontSize: s.sub, letterSpacing: "0.2em" }}
        >
          Period Tracker
        </span>
      </div>
    </div>
  );
};

export const FlowAILogoWhite = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-3">
      <FlowAIIcon size={s.icon} white />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5 leading-none">
          <span
            className="font-bold text-white"
            style={{ fontSize: s.fontSize, fontFamily: "Instrument Sans, sans-serif", lineHeight: 1 }}
          >
            Flow
          </span>
          <span
            className="font-extrabold text-white"
            style={{ fontSize: s.fontSize, fontFamily: "Instrument Sans, sans-serif", lineHeight: 1 }}
          >
            AI
          </span>
          <span className="text-white/80 ml-1" style={{ fontSize: s.fontSize * 0.55 }}>✨</span>
        </div>
        <span
          className="font-medium tracking-widest uppercase text-white/60 mt-0.5"
          style={{ fontSize: s.sub, letterSpacing: "0.22em" }}
        >
          AI Period Tracker
        </span>
      </div>
    </div>
  );
};
