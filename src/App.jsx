import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Crud from "./Crud";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "./context/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// ProtectedRoute checks if user is logged in before allowing access
const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup listener on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Loading state while checking session
  if (session === null) {
    return <p>Loading...</p>;
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected CRUD route */}
          <Route
            path="/crud"
            element={
              <ProtectedRoute>
                <Crud />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown routes to /crud */}
          <Route path="*" element={<Navigate to="/crud" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
