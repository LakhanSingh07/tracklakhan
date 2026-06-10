import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/appContext";

import { ElementSplashScreen } from "@/pages/ElementSplashScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { AuthSignUp, AuthSignIn, AuthOTP, AuthPassword, AuthSuccess } from "@/pages/AuthSignUp";
import { ProfileSetupScreen, ProfilePreparingScreen } from "@/pages/ProfileSetupScreen";
import { NotificationCenterScreen } from "@/pages/NotificationCenterScreen";
import { SymptomTrackerScreen } from "@/pages/SymptomTrackerScreen";
import { PredictionScreen } from "@/pages/PredictionScreen";
import { HomeScreen } from "@/pages/HomeScreen";
import { CalendarScreen } from "@/pages/CalendarScreen";
import { LogEntryScreen, LogWeightScreen, LogTemperatureScreen, LogWaterScreen } from "@/pages/LogEntryScreen";
import { LogMoodScreen } from "@/pages/LogMoodScreen";
import { TrackerScreen } from "@/pages/TrackerScreen";
import { MyCyclesScreen } from "@/pages/MyCyclesScreen";
import { HealthBarScreen } from "@/pages/HealthScreen";
import { PhasePeriodScreen, PhaseGrowthScreen, PhaseReleaseScreen, PhaseProgesteroneScreen } from "@/pages/PhaseScreens";
import { EditPeriodScreen } from "@/pages/EditPeriodScreen";
import { AICoachScreen } from "@/pages/AICoachScreen";
import { InsightsScreen } from "@/pages/InsightsScreen";
import { HealthReportScreen } from "@/pages/HealthReportScreen";
import { PCOSScreen } from "@/pages/PCOSScreen";
import {
  AccountScreen,
  PersonalDataScreen,
  ReminderScreen,
  AccountSecurityScreen,
  LogoutConfirmDialog,
} from "@/pages/AccountScreen";
import {
  PremiumScreen,
  BillingScreen,
  PaymentMethodsScreen,
  PaymentSummaryScreen,
  PaymentProgressScreen,
  CongratulationsScreen,
} from "@/pages/PremiumScreen";

function AppRouter() {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case "splash": return <ElementSplashScreen />;
    case "onboarding": return <OnboardingScreen />;
    case "auth-signup": return <AuthSignUp />;
    case "auth-signup-form": return <AuthSignUp />;
    case "auth-signin": return <AuthSignIn />;
    case "auth-otp": return <AuthOTP />;
    case "auth-password": return <AuthPassword />;
    case "auth-success": return <AuthSuccess />;
    case "profile-setup": return <ProfileSetupScreen />;
    case "profile-preparing": return <ProfilePreparingScreen />;
    case "notifications": return <NotificationCenterScreen />;
    case "symptom-tracker": return <SymptomTrackerScreen />;
    case "prediction": return <PredictionScreen />;
    case "home": return <HomeScreen />;
    case "calendar": return <CalendarScreen />;
    case "log-entry": return <LogEntryScreen />;
    case "log-mood": return <LogMoodScreen />;
    case "log-weight": return <LogWeightScreen />;
    case "log-temperature": return <LogTemperatureScreen />;
    case "log-water": return <LogWaterScreen />;
    case "tracker": return <TrackerScreen />;
    case "cycles": return <MyCyclesScreen />;
    case "health-bar": return <HealthBarScreen />;
    case "health-area": return <HealthBarScreen />;
    case "phase-period": return <PhasePeriodScreen />;
    case "phase-growth": return <PhaseGrowthScreen />;
    case "phase-release": return <PhaseReleaseScreen />;
    case "phase-progesterone": return <PhaseProgesteroneScreen />;
    case "edit-period": return <EditPeriodScreen />;
    case "ai-coach": return <AICoachScreen />;
    case "insights": return <InsightsScreen />;
    case "health-report": return <HealthReportScreen />;
    case "pcos": return <PCOSScreen />;
    case "account": return <AccountScreen />;
    case "personal-data": return <PersonalDataScreen />;
    case "reminder": return <ReminderScreen />;
    case "account-security": return <AccountSecurityScreen />;
    case "logout-confirm": return <LogoutConfirmDialog />;
    case "premium": return <PremiumScreen />;
    case "billing": return <BillingScreen />;
    case "payment-methods": return <PaymentMethodsScreen />;
    case "payment-summary": return <PaymentSummaryScreen />;
    case "payment-progress": return <PaymentProgressScreen />;
    case "congratulations": return <CongratulationsScreen />;
    default: return <HomeScreen />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <AppRouter />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
