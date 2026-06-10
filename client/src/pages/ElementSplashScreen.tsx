import { useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/appContext";

const FloatingPetal = ({ delay, x, y, size, rotate }: { delay: number; x: number; y: number; size: number; rotate: number }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%`, fontSize: size }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.85, 0.6, 0.8, 0],
      scale: [0, 1.1, 0.9, 1, 0.7],
      rotate: [rotate - 30, rotate, rotate + 25, rotate + 10, rotate + 50],
      y: [0, -18, -8, -28, -55],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      delay,
      repeat: Infinity,
      repeatDelay: 2 + Math.random() * 3,
      ease: "easeInOut",
    }}
  >
    🌸
  </motion.div>
);

const FloatingDot = ({ delay, x, y, size, color }: { delay: number; x: number; y: number; size: number; color: string }) => (
  <motion.div
    className="absolute pointer-events-none rounded-full"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
    animate={{
      opacity: [0, 0.7, 0.5, 0],
      y: [0, -20, -35, -55],
      scale: [0.5, 1, 0.85, 0.6],
    }}
    transition={{
      duration: 3 + Math.random(),
      delay,
      repeat: Infinity,
      repeatDelay: 2 + Math.random() * 3,
      ease: "easeOut",
    }}
  />
);

const TwinkleStar = ({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%`, fontSize: size }}
    animate={{
      opacity: [0.1, 1, 0.15, 0.9, 0.1],
      scale: [0.7, 1.3, 0.8, 1.2, 0.7],
    }}
    transition={{ duration: 2.5 + Math.random(), delay, repeat: Infinity, ease: "easeInOut" }}
  >
    ✨
  </motion.div>
);

const FloatingHeart = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute pointer-events-none select-none text-base"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      opacity: [0, 0.8, 0.6, 0],
      scale: [0.4, 1.1, 0.9, 0.6],
      y: [0, -25, -45, -70],
    }}
    transition={{ duration: 3.5, delay, repeat: Infinity, repeatDelay: 4 + Math.random() * 3, ease: "easeOut" }}
  >
    💕
  </motion.div>
);

export const ElementSplashScreen = (): JSX.Element => {
  const { navigate } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => navigate("onboarding"), 3400);
    return () => clearTimeout(timer);
  }, [navigate]);

  const petals = [
    { delay: 0.0, x: 6,  y: 12, size: 28, rotate: -20 },
    { delay: 0.6, x: 80, y: 8,  size: 22, rotate: 30  },
    { delay: 1.1, x: 14, y: 72, size: 26, rotate: -10 },
    { delay: 0.3, x: 76, y: 68, size: 24, rotate: 45  },
    { delay: 1.6, x: 4,  y: 42, size: 20, rotate: -30 },
    { delay: 0.9, x: 87, y: 38, size: 22, rotate: 20  },
    { delay: 1.3, x: 48, y: 4,  size: 18, rotate: 15  },
    { delay: 2.1, x: 33, y: 85, size: 24, rotate: -15 },
    { delay: 0.7, x: 63, y: 82, size: 20, rotate: 35  },
    { delay: 1.8, x: 90, y: 60, size: 18, rotate: -5  },
  ];

  const dots = [
    { delay: 0.2, x: 18, y: 28, size: 8,  color: "rgba(255,143,163,0.6)" },
    { delay: 1.0, x: 74, y: 22, size: 10, color: "rgba(255,101,125,0.5)" },
    { delay: 0.7, x: 28, y: 62, size: 7,  color: "rgba(255,175,192,0.7)" },
    { delay: 1.8, x: 66, y: 52, size: 9,  color: "rgba(255,143,163,0.55)" },
    { delay: 0.4, x: 10, y: 52, size: 6,  color: "rgba(255,101,125,0.4)" },
    { delay: 1.3, x: 84, y: 73, size: 8,  color: "rgba(255,175,192,0.65)" },
    { delay: 2.2, x: 43, y: 78, size: 7,  color: "rgba(255,143,163,0.5)" },
    { delay: 0.9, x: 56, y: 16, size: 10, color: "rgba(255,101,125,0.6)" },
    { delay: 1.5, x: 70, y: 35, size: 6,  color: "rgba(255,175,192,0.7)" },
    { delay: 2.5, x: 22, y: 42, size: 8,  color: "rgba(255,143,163,0.5)" },
  ];

  const stars = [
    { delay: 0.1, x: 16, y: 20, size: 14 },
    { delay: 0.9, x: 76, y: 16, size: 12 },
    { delay: 0.5, x: 86, y: 53, size: 10 },
    { delay: 1.4, x: 8,  y: 58, size: 12 },
    { delay: 0.7, x: 40, y: 10, size: 10 },
    { delay: 1.9, x: 58, y: 88, size: 14 },
    { delay: 1.1, x: 23, y: 83, size: 10 },
    { delay: 2.3, x: 92, y: 28, size: 11 },
  ];

  const hearts = [
    { delay: 0.5, x: 20, y: 48 },
    { delay: 1.8, x: 70, y: 42 },
    { delay: 3.0, x: 43, y: 68 },
    { delay: 1.2, x: 78, y: 22 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center" style={{ minHeight: "100dvh" }}>

      {/* Full background gradient */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(160deg, #FFF0F4 0%, #FFCCD8 35%, #FFB3C6 65%, #FF8FA3 100%)",
        }}
      />

      {/* Soft background blobs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 350, height: 350, top: -100, left: -100,
          background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,175,192,0.25) 60%, transparent 80%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 280, height: 280, bottom: -80, right: -80,
          background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,101,125,0.15) 60%, transparent 80%)",
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 220, height: 220, top: "38%", right: -70,
          background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-7 pt-3 z-20 h-11">
        <span className="text-[15px] font-semibold text-white drop-shadow">9:41</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="4" width="3" height="8" rx="1" fill="white" fillOpacity="0.5"/>
            <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="white" fillOpacity="0.7"/>
            <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="13.5" y="0" width="3" height="12" rx="1" fill="white"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <path d="M8 2C10.8 2 13.3 3.2 15 5.2L13.5 6.8C12.1 5.1 10.2 4 8 4C5.8 4 3.9 5.1 2.5 6.8L1 5.2C2.7 3.2 5.2 2 8 2Z" fillOpacity="0.9"/>
            <path d="M8 5.5C9.8 5.5 11.4 6.3 12.5 7.5L11 9C10.2 8.1 9.2 7.5 8 7.5C6.8 7.5 5.8 8.1 5 9L3.5 7.5C4.6 6.3 6.2 5.5 8 5.5Z"/>
            <circle cx="8" cy="11" r="1.5"/>
          </svg>
          <div className="flex items-center">
            <div className="h-[13px] w-[24px] rounded-[3px] border-2 border-white/80 bg-white/90 flex items-center px-0.5">
              <div className="h-[7px] w-[14px] rounded-sm bg-pink-400" />
            </div>
            <div className="h-[6px] w-[2px] rounded-r-sm bg-white/60 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      {petals.map((p, i) => <FloatingPetal key={`petal-${i}`} {...p} />)}
      {dots.map((d, i) => <FloatingDot key={`dot-${i}`} {...d} />)}
      {stars.map((s, i) => <TwinkleStar key={`star-${i}`} {...s} />)}
      {hearts.map((h, i) => <FloatingHeart key={`heart-${i}`} {...h} />)}

      {/* ---- CENTERED HERO CONTENT ---- */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">

        {/* Logo + rings container */}
        <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>

          {/* Outer pulsing glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: 0,
              background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,143,163,0.2) 55%, transparent 75%)",
            }}
            animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Spinning decorative ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: 20,
              border: "1.5px dashed rgba(255,255,255,0.55)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />

          {/* Spinning ring with dots */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: 10,
              border: "2px solid rgba(255,255,255,0.35)",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: i % 2 === 0 ? 9 : 6,
                  height: i % 2 === 0 ? 9 : 6,
                  background: i % 2 === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,175,192,0.8)",
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${deg}deg) translate(109px) translate(-50%, -50%)`,
                  boxShadow: "0 0 6px rgba(255,255,255,0.8)",
                }}
              />
            ))}
          </motion.div>

          {/* White card circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 160, damping: 16 }}
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: 170,
              height: 170,
              background: "rgba(255,255,255,0.97)",
              boxShadow: "0 0 0 6px rgba(255,255,255,0.3), 0 20px 60px rgba(255,101,125,0.35), 0 8px 20px rgba(255,143,163,0.3)",
            }}
          >
            {/* Inner soft pink ring */}
            <div
              className="absolute inset-3 rounded-full"
              style={{ background: "radial-gradient(circle, #FFF5F7 0%, #FFECF0 100%)" }}
            />

            {/* Logo image */}
            <motion.img
              src="/figmaAssets/image-1.png"
              alt="Flowly logo"
              className="relative z-10"
              style={{ width: 110, height: 110, objectFit: "contain" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.55, type: "spring", stiffness: 200 }}
            />
          </motion.div>
        </div>

        {/* App title */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.55, ease: "easeOut" }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-1">
            <h1
              className="text-white font-bold tracking-wide drop-shadow-lg"
              style={{
                fontSize: 42,
                fontFamily: "Instrument Sans, sans-serif",
                textShadow: "0 2px 16px rgba(200,40,70,0.25), 0 4px 30px rgba(255,101,125,0.2)",
                lineHeight: 1.1,
              }}
            >
              Flow
            </h1>
            <motion.span
              animate={{ rotate: [0, 12, -8, 12, 0], scale: [1, 1.12, 1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
              className="text-white font-bold drop-shadow-lg"
              style={{
                fontSize: 42,
                fontFamily: "Instrument Sans, sans-serif",
                textShadow: "0 2px 20px rgba(255,255,255,0.4)",
                lineHeight: 1.1,
              }}
            >
              AI
            </motion.span>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-xl ml-1"
            >
              ✨
            </motion.span>
          </div>
          <p
            className="text-white/80 font-semibold tracking-[0.22em] uppercase mt-1.5 drop-shadow"
            style={{ fontSize: 11, letterSpacing: "0.22em" }}
          >
            AI Period Tracker
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.5 }}
          className="mt-3 text-white/75 text-center font-medium"
          style={{ fontSize: 13, textShadow: "0 1px 6px rgba(0,0,0,0.1)" }}
        >
          Know Your Cycle. Own Your Health. 🌸
        </motion.p>

        {/* Animated loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center gap-2 mt-10"
        >
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i === 2 ? 12 : i === 1 || i === 3 ? 10 : 8,
                height: i === 2 ? 12 : i === 1 || i === 3 ? 10 : 8,
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(255,101,125,0.3)",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.35, 1, 0.35],
              }}
              transition={{
                duration: 1.1,
                delay: 1.4 + i * 0.14,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none h-28 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ x: ["0%", "-12%", "0%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "115%" }}
        >
          <svg viewBox="0 0 450 112" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 70 Q56 35 112 60 Q168 85 224 58 Q280 32 336 62 Q393 88 450 60 L450 112 L0 112 Z" fill="rgba(255,255,255,0.12)" />
            <path d="M0 82 Q70 50 140 75 Q210 98 280 72 Q350 48 450 80 L450 112 L0 112 Z" fill="rgba(255,255,255,0.18)" />
            <path d="M0 94 Q90 72 180 88 Q270 104 360 86 Q405 78 450 92 L450 112 L0 112 Z" fill="rgba(255,255,255,0.25)" />
          </svg>
        </motion.div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20">
        <div className="w-[134px] h-[5px] rounded-full bg-white/60" />
      </div>
    </div>
  );
};
