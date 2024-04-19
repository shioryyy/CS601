import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "./features/routes/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserContext from "./features/contexts/UserContext";
import FirstPage from "./components/FirstPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Loading from "./components/LoadingContainer";
import Profile from "./components/Profile"
import Networks from "./components/Networks";
import Jobs from "./components/Jobs";
import ProfileCreation from "./components/ProfileCreation";
import UserProfile from "./components/UserProfile";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false); 
    });
    return () => unsubscribe();
  }, [auth]);

  if (isLoadingAuth) return <Loading />;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><Networks /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/create-profile" element={<ProtectedRoute><ProfileCreation /></ProtectedRoute>} />
          <Route path="/:userID" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
};

export default App;