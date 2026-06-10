import { useEffect } from "react";
import { motion } from "framer-motion";
import { MobileLayout, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import logoSrc from "@assets/flowailogo_1781087470446.png";

export const ElementSplashScreen = (): JSX.Element => {
  const { navigate } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => navigate("onboarding"), 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <MobileLayout gradient="linear-gradient(160deg, #FDF4FF 0%, #F9E8FF 40%, #FFE8F4 100%)">
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100dvh" }}>

        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-7 pt-3 z-20 h-11">
          <span className="text-[15px] font-semibold text-gray-500">9:41</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="4" width="3" height="8" rx="1" fill="#9CA3AF" fillOpacity="0.8"/>
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="#9CA3AF" fillOpacity="0.9"/>
              <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill="#6B7280"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#4B5563"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#6B7280">
              <path d="M8 2C10.8 2 13.3 3.2 15 5.2L13.5 6.8C12.1 5.1 10.2 4 8 4C5.8 4 3.9 5.1 2.5 6.8L1 5.2C2.7 3.2 5.2 2 8 2Z" fillOpacity="0.9"/>
              <path d="M8 5.5C9.8 5.5 11.4 6.3 12.5 7.5L11 9C10.2 8.1 9.2 7.5 8 7.5C6.8 7.5 5.8 8.1 5 9L3.5 7.5C4.6 6.3 6.2 5.5 8 5.5Z"/>
              <circle cx="8" cy="11" r="1.5"/>
            </svg>
            <div className="flex items-center">
              <div className="h-[13px] w-[24px] rounded-[3px] border-2 border-gray-400/60 flex items-center px-0.5">
                <div className="h-[7px] w-[14px] rounded-sm bg-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Logo + name — centered */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <img
            src={logoSrc}
            alt="FlowAI Logo"
            style={{ width: 200, height: 200, objectFit: "contain" }}
          />
        </motion.div>

        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
