import React, { useState, useRef, useEffect } from 'react';
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import "./App.css";

import HomeScreen from './screens/HomeScreen';
import InterviewsScreen from './screens/InterviewsScreen';
import LoginScreen from './screens/LoginScreen';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllData } from "./redux/appSlice";
import { clearUser } from "./redux/userSlice";
import { clearJournal } from "./redux/journalSlice";
import { clearInterviews } from "./redux/interviewsSlice";
import { RootState } from './redux/store';
import LinkC from "./components/LinkC";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  if (!jwtToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  const dispatch = useDispatch();
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const user = useSelector((state: RootState) => state.user);
  const location = useLocation();
  const isLoginScreen = location.pathname === '/';
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const handleLogout = () => {
    // Clear all Redux slices
    dispatch(clearAllData());
    dispatch(clearUser());
    dispatch(clearJournal());
    dispatch(clearInterviews());
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className={`app-container ${isLoginScreen ? 'login-screen-container' : ''}`}>
      {!isLoginScreen && (
        <div className="app-header">
          <div className="app-title">Dev Journey</div>
          <div className="app-nav">
            {jwtToken && (
              <div className="nav-links">
                <LinkC to="/home">Journal</LinkC>
                    <LinkC to="/interviews">Applications</LinkC>
              </div>
            )}
          </div>
          <div className="app-actions">
            {jwtToken && (
              <div className="user-menu-container" ref={userMenuRef}>
                <button 
                  className="user-button" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="user-avatar">
                    {user.picture ? (
                      <img src={user.picture} alt="User" className="user-avatar-img" />
                    ) : (
                      <span className="user-avatar-icon">👤</span>
                    )}
                  </div>
                </button>
                
                {isUserMenuOpen && (
                  <div className="user-menu">
                    <button className="user-menu-item logout" onClick={handleLogout}>
                      <span className="user-menu-icon">⤴</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><InterviewsScreen /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={jwtToken ? "/home" : "/"} replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AppInner() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;
