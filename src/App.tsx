import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
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
import { ThemeProvider } from "./components/theme-provider"
import DashboardEvents from "./pages/DashboardEvents"
import DashboardCategory from "./pages/DashboardCategory"
 import EventDetailPage from "./pages/event-detail"
import HomePage from "./pages/home"
import DashboardSettings from "./pages/DashnoardSettings"
import MemberSpace from "./pages/member"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
            <Route path="/member" element={<MemberSpace />} />

          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/events" element={<DashboardEvents />} />
            <Route path="/dashboard/events_category" element={<DashboardCategory />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/apps" element={<Apps />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Route>
        </Routes>
      </Router>  
    </ThemeProvider>
  )
}

export default App
