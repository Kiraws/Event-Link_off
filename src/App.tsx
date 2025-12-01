import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import DashboardLayout from "./layouts/DashboardLayout"
import PublicLayout from "./layouts/PublicLayout"
import Dashboard from "./pages/Dashboard"
import Apps from "./pages/Apps"
import Users from "./pages/Users"

import AboutPage from "./pages/about"
import EventPage from "./pages/events"
import ContactPage from "./pages/contact"
import SignupPage from "./pages/signup"
import LoginPage from "./pages/login"
import VerifyEmailPage from "./pages/verify-email"
import GoogleCallbackPage from "./pages/google-callback"
import AccessDeniedPage from "./pages/access-denied"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext"
import { AdminRoute } from "./components/AdminRoute"
import DashboardEvents from "./pages/DashboardEvents"
import DashboardCategory from "./pages/DashboardCategory"
 import EventDetailPage from "./pages/event-detail"
import HomePage from "./pages/home"
import DashboardSettings from "./pages/DashnoardSettings"
import MemberSpace from "./pages/member"
import EventParticipantsPage from "./pages/EventParticipants"
import DashboardContact from "./pages/DashboardContact"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventPage />} />
           <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/member" element={<MemberSpace />} />
            <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          </Route>

          {/* Route pour la page d'accès refusé */}
          <Route element={<PublicLayout />}>
            <Route path="/access-denied" element={<AccessDeniedPage />} />
          </Route>

          {/* Routes protégées par le middleware AdminRoute - Seuls les ADMIN peuvent accéder */}
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/events" element={<DashboardEvents />} />
              <Route path="/dashboard/events/:eventId/participants" element={<EventParticipantsPage />} />
              <Route path="/dashboard/events_category" element={<DashboardCategory />} />
              <Route path="/dashboard/users" element={<Users />} />
              <Route path="/dashboard/contact" element={<DashboardContact />} />
              <Route path="/dashboard/apps" element={<Apps />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
