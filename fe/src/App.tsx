import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SuspenseFallback from "./pages/Suspense";
import "./App.css";
import { Toaster } from "./components/ui/sonner";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const Profile = lazy(() => import("./pages/Profile"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ChatbotSettingsPage = lazy(() => import("./pages/ChatbotSettingsPage"));

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute restricted>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute restricted>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route
              path="/"
              element={
                <PublicRoute restricted>
                  <Index />
                </PublicRoute>
              }
            />

            <Route
              path="/chat/:id"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics/:id"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings/:id"
              element={
                <ProtectedRoute>
                  <ChatbotSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Public API docs route */}
            <Route
              path="/docs"
              element={
                <PublicRoute>
                  <ApiDocs />
                </PublicRoute>
              }
            />

          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
