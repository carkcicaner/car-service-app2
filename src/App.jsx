import React, { useState, useEffect } from 'react';
import { onAuthChange, getUserProfile } from './api.js';
import Auth from './components/Auth.jsx';
import GalleryDashboard from './components/GalleryDashboard.jsx';
import ServiceDashboard from './components/ServiceDashboard.jsx';
import BuyerDashboard from './components/BuyerDashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderDashboard = () => {
    if (!userProfile) {
      return <div className="text-center p-10">Kullanıcı paneli yükleniyor...</div>;
    }

    switch (userProfile.role) {
      case 'Galeri Sahibi':
      case 'Bireysel Satıcı':
        return <GalleryDashboard user={user} userProfile={userProfile} />;
      case 'Servis':
        return <ServiceDashboard user={user} userProfile={userProfile} />;
      case 'Alıcı':
        return <BuyerDashboard user={user} userProfile={userProfile} />;
      default:
        return <div className="text-center p-10">Tanımsız kullanıcı rolü.</div>;
    }
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <p className="text-xl font-semibold text-gray-700">OtoRapor Yükleniyor...</p>
                <div className="loader mt-4"></div>
            </div>
            <style>{`.loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: auto; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
  }

  return (
    <div className="font-sans">
      {user ? renderDashboard() : <Auth onLoginSuccess={setUser} />}
    </div>
  );
}

export default App;

