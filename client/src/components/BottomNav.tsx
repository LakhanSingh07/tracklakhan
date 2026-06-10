import { motion } from "framer-motion";
import { useApp, Screen } from "@/lib/appContext";

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
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path d="M15 7V23M7 15H23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const HeartIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 21C12 21 3 15 3 9C3 6 5.5 4 8 4C9.8 4 11.2 4.9 12 6C12.8 4.9 14.2 4 16 4C18.5 4 21 6 21 9C21 15 12 21 12 21Z"
      fill={active ? "#FF657D" : "none"} stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const PersonIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill={active ? "#FF657D" : "none"} stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.8"/>
    <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20" stroke={active ? "#FF657D" : "#9E9E9E"} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const navItems: NavItem[] = [
  { icon: (a) => <HomeIcon active={a} />, label: "Home", screen: "home" },
  { icon: (a) => <CalendarIcon active={a} />, label: "Calendar", screen: "calendar" },
  { icon: () => <PlusIcon />, label: "Log", screen: "log-entry", isCenter: true },
  { icon: (a) => <HeartIcon active={a} />, label: "Health", screen: "health-bar" },
  { icon: (a) => <PersonIcon active={a} />, label: "Account", screen: "account" },
];

export const BottomNav = () => {
  const { currentScreen, navigate } = useApp();

  const mainScreens: Screen[] = ["home", "calendar", "log-entry", "health-bar", "account"];
  const healthScreens: Screen[] = ["health-bar", "health-area"];
  const calendarScreens: Screen[] = ["calendar", "edit-period", "phase-period", "phase-growth", "phase-release", "phase-progesterone"];

  const isActive = (screen: Screen) => {
    if (screen === "health-bar") return healthScreens.includes(currentScreen);
    if (screen === "calendar") return calendarScreens.includes(currentScreen);
    if (screen === "account") return ["account", "personal-data", "reminder", "account-security", "premium", "billing"].includes(currentScreen);
    if (screen === "home") return ["home", "tracker", "cycles"].includes(currentScreen);
    return currentScreen === screen;
  };

  return (
    <div className="flex items-center justify-around bg-white border-t border-gray-100 px-4 pt-2 pb-1 shadow-lg">
      {navItems.map((item) => (
        <motion.button
          key={item.screen}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(item.screen)}
          className="flex flex-col items-center gap-1 relative"
        >
          {item.isCenter ? (
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-7"
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
              whileHover={{ scale: 1.05 }}
            >
              <PlusIcon />
            </motion.div>
          ) : (
            <>
              <div className="relative">
                {item.icon(isActive(item.screen))}
                {isActive(item.screen) && !item.isCenter && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF657D]"
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive(item.screen) ? "text-[#FF657D]" : "text-gray-400"}`}>
                {item.label}
              </span>
            </>
          )}
        </motion.button>
      ))}
    </div>
  );
};
