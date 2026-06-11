import { motion } from "framer-motion";
import { useApp, Screen } from "@/lib/appContext";
import { useTranslation } from "react-i18next";

interface NavItem {
  icon: (active: boolean) => JSX.Element;
  label: string;
  screen: Screen;
  isCenter?: boolean;
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3L21 9.5V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V9.5Z"
      fill={active ? "#FF657D" : "none"} stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.8" fill={active ? "#FFE7EA" : "none"}/>
    <path d="M8 2V5M16 2V5M3 9H21" stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8" cy="14" r="1.5" fill={active ? "#FF657D" : "#9E9E9E"}/>
    <circle cx="12" cy="14" r="1.5" fill={active ? "#FF657D" : "#9E9E9E"} opacity={active ? 1 : 0.5}/>
    <circle cx="16" cy="14" r="1.5" fill={active ? "#FF657D" : "#9E9E9E"} opacity={active ? 0.5 : 0.3}/>
  </svg>
);

const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 6V22M6 14H22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const SparkIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill={active ? "#8B5CF6" : "none"}
      stroke={active ? "#8B5CF6" : "#9E9E9E"}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M19 16L19.8 18.2L22 19L19.8 19.8L19 22L18.2 19.8L16 19L18.2 18.2L19 16Z"
      fill={active ? "#EC4899" : "none"}
      stroke={active ? "#EC4899" : "#C0C0C0"}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const CommunityIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="9" r="3" fill={active ? "#FF657D" : "none"} stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.7"/>
    <circle cx="16" cy="9" r="3" fill={active ? "#FFE7EA" : "none"} stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.7"/>
    <path d="M3.5 20C3.5 17.2 5.4 15.2 8 15.2C10.6 15.2 12.5 17.2 12.5 20" stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M11.5 20C11.5 17.2 13.4 15.2 16 15.2C18.6 15.2 20.5 17.2 20.5 20" stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
);

const navItems: NavItem[] = [
  { icon: (a) => <HomeIcon active={a} />, label: "Home", screen: "home" },
  { icon: (a) => <CalendarIcon active={a} />, label: "Calendar", screen: "calendar" },
  { icon: () => <PlusIcon />, label: "Log", screen: "log-entry", isCenter: true },
  { icon: (a) => <SparkIcon active={a} />, label: "AI Coach", screen: "ai-coach" },
  { icon: (a) => <CommunityIcon active={a} />, label: "Community", screen: "community" },
];

export const BottomNav = () => {
  const { currentScreen, navigate } = useApp();
  const { t } = useTranslation();

  const calendarScreens: Screen[] = ["calendar", "edit-period", "phase-period", "phase-growth", "phase-release", "phase-progesterone"];
  const aiScreens: Screen[] = ["ai-coach", "insights", "pcos", "health-bar", "health-area"];

  const isActive = (screen: Screen) => {
    if (screen === "ai-coach") return aiScreens.includes(currentScreen);
    if (screen === "calendar") return calendarScreens.includes(currentScreen);
    if (screen === "community") return currentScreen === "community";
    if (screen === "home") return ["home", "tracker", "cycles"].includes(currentScreen);
    return currentScreen === screen;
  };

  const getActiveColor = (screen: Screen) => {
    if (screen === "ai-coach") return "#8B5CF6";
    return "#FF657D";
  };

  return (
    <div className="flex items-center justify-around bg-white border-t border-gray-100 px-4 pt-2 pb-1 shadow-lg">
      {navItems.map((item) => {
        const active = isActive(item.screen);
        const color = getActiveColor(item.screen);
        return (
          <motion.button
            key={item.screen}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              if (item.isCenter && currentScreen === "community") {
                window.dispatchEvent(new CustomEvent("flowai:open-community-composer"));
                return;
              }
              navigate(item.screen);
            }}
            className="flex flex-col items-center gap-0.5 relative"
            data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
          >
            {item.isCenter ? (
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-7"
                style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
                whileHover={{ scale: 1.05 }}
                animate={{ boxShadow: "0 4px 20px rgba(255,101,125,0.45)" }}
              >
                <PlusIcon />
              </motion.div>
            ) : (
              <>
                <div className="relative">
                  {item.icon(active)}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: color }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? color : "#9E9E9E" }}
                >
                  {t("nav_" + item.label.toLowerCase().replace(" ", "_"))}
                </span>
              </>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
