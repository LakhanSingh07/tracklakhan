import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export const MobileLayout = ({ children, className = "", gradient }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100" style={{ background: "#f0f0f0" }}>
      <div
        className={`relative w-full max-w-[393px] min-h-screen overflow-hidden ${className}`}
        style={{
          background: gradient || "linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)",
          minHeight: "100svh",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const StatusBar = (_props: { dark?: boolean }) => (
  <div
    aria-hidden="true"
    className="w-full shrink-0"
    style={{ height: "max(env(safe-area-inset-top), 18px)" }}
  />
);

export const HomeIndicator = (_props: { dark?: boolean }) => (
  <div
    aria-hidden="true"
    className="w-full shrink-0"
    style={{ height: "max(env(safe-area-inset-bottom), 16px)" }}
  />
);
