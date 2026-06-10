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

export const StatusBar = ({ dark = false }: { dark?: boolean }) => (
  <div className={`flex h-[45px] w-full items-start justify-between px-[31px] pt-[13px] z-50`}>
    <span className={`text-[15px] font-semibold ${dark ? "text-white" : "text-black"}`}>9:41</span>
    <div className="flex items-center gap-1 mt-[2px]">
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
        <rect x="0" y="3" width="3" height="9" rx="1" fill={dark ? "white" : "black"} opacity="0.4"/>
        <rect x="4" y="2" width="3" height="10" rx="1" fill={dark ? "white" : "black"} opacity="0.6"/>
        <rect x="8" y="0" width="3" height="12" rx="1" fill={dark ? "white" : "black"} opacity="0.8"/>
        <rect x="12" y="0" width="3" height="12" rx="1" fill={dark ? "white" : "black"}/>
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <path d="M8 3C10.3 3 12.4 4 13.9 5.7L15.5 4C13.5 1.9 10.9 0.6 8 0.6C5.1 0.6 2.5 1.9 0.5 4L2.1 5.7C3.6 4 5.7 3 8 3Z" fill={dark ? "white" : "black"} opacity="0.6"/>
        <path d="M8 6C9.4 6 10.7 6.6 11.6 7.6L13.2 5.9C11.9 4.5 10 3.6 8 3.6C6 3.6 4.1 4.5 2.8 5.9L4.4 7.6C5.3 6.6 6.6 6 8 6Z" fill={dark ? "white" : "black"} opacity="0.8"/>
        <circle cx="8" cy="11" r="1.5" fill={dark ? "white" : "black"}/>
      </svg>
      <div className="flex items-center gap-[2px]">
        <div className="h-[12px] rounded-[2px] bg-current" style={{ width: "22px", background: dark ? "white" : "black", opacity: 0.9 }}></div>
        <div className="h-[6px] w-[2px] rounded-r-full" style={{ background: dark ? "white" : "black", opacity: 0.4 }}></div>
      </div>
    </div>
  </div>
);

export const HomeIndicator = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex items-center justify-center h-[34px] w-full">
    <div className={`h-[5px] w-[134px] rounded-full ${dark ? "bg-white" : "bg-black"}`} style={{ opacity: dark ? 0.5 : 1 }} />
  </div>
);
