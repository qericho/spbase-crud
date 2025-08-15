import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Crud from "./Crud";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "./context/ThemeContext";
import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "./supabaseClient";

// --- Auth Context to share session across app ---
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};

// --- Protected Route ---
const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Redirect logged-in users from login/register pages ---
const PublicRoute = ({ children }) => {
  const { session } = useAuth();

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/crud" replace />;
  }

  return children;
};

// --- App Component ---
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected CRUD route */}
            <Route
              path="/crud"
              element={
                <ProtectedRoute>
                  <Crud />
                </ProtectedRoute>
              }
            />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all unknown routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
