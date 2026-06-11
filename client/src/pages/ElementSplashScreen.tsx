import { useEffect } from "react";
import { motion } from "framer-motion";
import { MobileLayout, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import logoSrc from "@assets/flowailogo_1781087470446.png";

export const ElementSplashScreen = (): JSX.Element => {
  const { authLoading, authUser, navigate } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading) {
        navigate(authUser ? "home" : "onboarding");
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [authLoading, authUser, navigate]);

  return (
    <MobileLayout gradient="linear-gradient(160deg, #FDF4FF 0%, #F9E8FF 40%, #FFE8F4 100%)">
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100dvh" }}>
        {/* Logo + name centered */}
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
