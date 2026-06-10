import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/lib/appContext";

const columnGroups = [
  {
    position: "top-[-107px] left-[116px]",
    cards: [
      "bg-[#ffffff66]",
      "bg-[#ffffff80]",
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_100%)]",
    ],
  },
  {
    position: "top-[520px] left-[115px]",
    cards: [
      "bg-[linear-gradient(0deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_100%)]",
      "bg-[#ffffff4c]",
      "bg-white",
    ],
  },
  {
    position: "top-[-37px] left-[-65px]",
    cards: ["bg-[#ffffff4c]", "bg-[#ffffff33]"],
  },
  {
    position: "top-[381px] left-[-65px]",
    cards: ["bg-[#ffffff33]", "bg-[#ffffff66]"],
  },
  {
    position: "top-[-132px] left-[297px]",
    cards: ["bg-white", "bg-[#ffffff4c]"],
  },
  {
    position: "top-[286px] left-[297px]",
    cards: ["bg-[#ffffff4c]", "bg-[#ffffff80]", "bg-[#ffffff4c]"],
  },
];

export const ElementSplashScreen = (): JSX.Element => {
  const { navigate } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("onboarding");
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,rgba(249,249,249,1)_0%,rgba(255,240,242,1)_100%)]">
      <section
        aria-hidden="true"
        className="relative mx-auto min-h-screen w-full max-w-[393px] overflow-hidden"
      >
        {columnGroups.map((group, groupIndex) => (
          <motion.div
            key={`column-group-${groupIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.08, duration: 0.6 }}
            className={`absolute flex w-[161px] flex-col items-start gap-5 ${group.position}`}
          >
            {group.cards.map((cardClass, cardIndex) => (
              <Card
                key={`group-${groupIndex}-card-${cardIndex}`}
                className={`w-full rounded-[10px] border-0 shadow-none ${cardClass}`}
              >
                <CardContent className="h-[189px] p-0" />
              </Card>
            ))}
          </motion.div>
        ))}

        <header className="absolute left-0 top-0 z-10 flex h-[45px] w-full items-start justify-between px-[31.3px]">
          <div className="mt-[12.8px] flex w-[49.35px] justify-center rounded-[21.93px]">
            <p className="mt-[0.9px] h-[18.28px] w-[49.35px] text-center text-[15.5px] font-normal leading-[20.1px] tracking-[-0.37px] text-black [font-family:'Helvetica-Roman',Helvetica] whitespace-nowrap">
              9:41
            </p>
          </div>
          <img
            className="mt-[17.4px] h-[11.88px] w-[70.74px]"
            alt="Right side"
            src="/figmaAssets/right-side.png"
          />
        </header>

        <section className="absolute inset-0 flex items-center justify-center px-20">
          <div className="w-full max-w-[232px]">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-[232px] items-center justify-center"
            >
              <img
                className="h-[232px] w-[232px] object-contain"
                alt="Flowly period tracker logo"
                src="/figmaAssets/image-1.png"
              />
            </motion.div>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-16 left-0 right-0 flex justify-center"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-[#FF657D]"
                style={{ opacity: 0.4 + i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>

        <footer className="absolute bottom-0 left-0 flex h-[34px] w-full items-center justify-center">
          <div className="mt-[13px] ml-px h-[5px] w-[134px] rounded-[100px] bg-black" />
        </footer>
      </section>
    </main>
  );
};
