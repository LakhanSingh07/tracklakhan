import logoImage from "/flowai-logo.png";

interface FlowAILogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "icon-white";
  className?: string;
}

const SIZES = {
  sm: { full: 80, icon: 36 },
  md: { full: 120, icon: 52 },
  lg: { full: 160, icon: 80 },
  xl: { full: 220, icon: 110 },
};

export const FlowAIIcon = ({ size = 60, white = false }: { size?: number; white?: boolean }) => (
  <div
    style={{ width: size, height: size }}
    className="overflow-hidden rounded-full flex-shrink-0"
  >
    <img
      src={logoImage}
      alt="FLOWai"
      style={{
        width: size * 1.6,
        height: size * 1.6,
        objectFit: "cover",
        objectPosition: "center top",
        marginLeft: -(size * 0.3),
        filter: white ? "brightness(0) invert(1)" : undefined,
      }}
    />
  </div>
);

export const FlowAILogo = ({ size = "md", variant = "full", className = "" }: FlowAILogoProps) => {
  const s = SIZES[size];

  if (variant === "icon" || variant === "icon-white") {
    return (
      <FlowAIIcon
        size={s.icon}
        white={variant === "icon-white"}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logoImage}
        alt="FLOWai — AI Period Tracker"
        style={{ height: s.full, width: "auto", objectFit: "contain" }}
      />
    </div>
  );
};

export const FlowAILogoWhite = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const s = SIZES[size];
  return (
    <div className="flex items-center justify-center">
      <img
        src={logoImage}
        alt="FLOWai — AI Period Tracker"
        style={{ height: s.full, width: "auto", objectFit: "contain" }}
      />
    </div>
  );
};
