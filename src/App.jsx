import React, { useState } from 'react';
import VehicleOwner from './components/VehicleOwner.jsx';
import ServicePanel from './components/ServicePanel.jsx';
import BuyerPanel from './components/BuyerPanel.jsx';

function App() {
  const [view, setView] = useState('home'); // 'home', 'owner', 'service', 'buyer'

  const renderView = () => {
    switch (view) {
      case 'owner':
        return <VehicleOwner />;
      case 'service':
        return <ServicePanel />;
      case 'buyer':
        return <BuyerPanel />;
      default:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">OtoRapor Sistemine Hoş Geldiniz</h2>
            <p className="text-lg text-gray-600 mb-8">Lütfen yapmak istediğiniz işlemi seçin.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <button onClick={() => setView('owner')} className="w-full text-left p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all flex items-center space-x-4">
                <span className="text-4xl">🚗</span>
                <div>
                  <h3 className="text-lg font-bold text-blue-800">Araç Sahibi Paneli</h3>
                  <p className="text-gray-600">Sisteme yeni araç ekleyin.</p>
                </div>
              </button>
              <button onClick={() => setView('service')} className="w-full text-left p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-green-50 transition-all flex items-center space-x-4">
                <span className="text-4xl">🛠️</span>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Servis Paneli</h3>
                  <p className="text-gray-600">Yeni servis kaydı oluşturun.</p>
                </div>
              </button>
              <button onClick={() => setView('buyer')} className="w-full text-left p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-purple-50 transition-all flex items-center space-x-4">
                <span className="text-4xl">👤</span>
                <div>
                  <h3 className="text-lg font-bold text-purple-800">Alıcı Paneli</h3>
                  <p className="text-gray-600">Bir aracın servis geçmişini sorgulayın.</p>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            OtoRapor
          </h1>
          {view !== 'home' && (
            <button
              onClick={() => setView('home')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Ana Sayfa
            </button>
          )}
        </div>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;