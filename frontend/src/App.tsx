import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import StudentsPage from "@/pages/StudentsPage";
import TeachersPage from "@/pages/TeachersPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import CoursesPage from "@/pages/CoursesPage";
import AttendancePage from "@/pages/AttendancePage";
import ResultsPage from "@/pages/ResultsPage";
import NoticesPage from "@/pages/NoticesPage";
import PredictionsPage from "@/pages/PredictionsPage";
import FeesPage from "@/pages/FeesPage";
import AuditLogPage from "@/pages/AuditLogPage";
import SettingsPage from "@/pages/SettingsPage";
import { ChatWidget } from "@/components/ChatWidget";
import { CommandPalette } from "@/components/CommandPalette";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  useRealtimeNotifications();

  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<SignupPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="students"
          element={
            <ProtectedRoute roles={["admin", "teacher"]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="teachers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <TeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments"
          element={
            <ProtectedRoute roles={["admin", "teacher"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="predictions" element={<PredictionsPage />} />
        <Route
          path="fees"
          element={
            <ProtectedRoute roles={["admin", "student"]}>
              <FeesPage />
            </ProtectedRoute>
          }
        />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="audit-log"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<LandingPage />} />
    </Routes>
    {isAuthed && (
      <>
        <ChatWidget />
        <CommandPalette />
      </>
    )}
    </>
  );
}
