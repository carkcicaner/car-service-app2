import React, { useState } from 'react';
import { getServiceRecordsByPlate, getServiceRecordsByVin, logoutUser } from '../api.js';
import AccidentDetailModal from './AccidentDetailModal.jsx';

function BuyerDashboard({ user, userProfile }) {
    const [plate, setPlate] = useState('');
    const [vin, setVin] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleSearch = async (type) => {
        setLoading(true); setError(''); setSearchResult(null);
        const query = type === 'plate' ? plate : vin;
        if (!query) { setError('Lütfen bir arama kriteri girin.'); setLoading(false); return; }

        const result = type === 'plate'
            ? await getServiceRecordsByPlate(query)
            : await getServiceRecordsByVin(query);

        if (result && result.vehicle) {
            setSearchResult(result);
        } else {
            setError('Bu kritere uygun araç veya servis kaydı bulunamadı.');
        }
        setLoading(false);
    };

    const renderRecord = (record) => {
        const isAccident = record.type === 'Kaza';
        const cardColor = isAccident ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
        const icon = isAccident ? '💥' : '🔧';
        
        return (
             <li key={record.id} className={`p-4 border rounded-lg shadow-sm ${cardColor}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{icon} {record.type}</p>
                        {record.serviceProviderName && (
                            <p className="text-sm font-semibold text-gray-700 mt-1">
                                Servis: {record.serviceProviderName} {record.isVerifiedService && '✅'}
                            </p>
                        )}
                        <p className="text-sm text-gray-600">Tarih: {new Date(record.date).toLocaleDateString('tr-TR')}</p>
                        <p className="text-sm text-gray-600">Kilometre: {Number(record.mileage).toLocaleString('tr-TR')} km</p>
                    </div>
                     {isAccident && (
                        <button 
                            onClick={() => setSelectedRecord(record)}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg"
                        >Detayları Gör</button>
                    )}
                </div>
                 <div className="mt-3 pt-3 border-t border-dashed">
                    {isAccident ? (
                        <p><strong className="font-medium">Açıklama:</strong> {record.accidentDescription}</p>
                    ) : (
                        <>
                            <p><strong className="font-medium">Bakım Türü:</strong> {record.maintenanceType}</p>
                            <p className="mt-1"><strong className="font-medium">Yapılan İşlemler:</strong> {record.partsChanged}</p>
                        </>
                    )}
                </div>
            </li>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                 <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <button onClick={logoutUser} title="Oturumu Kapat">
                        <img src="/logo.svg" alt="OtoSicil Logo" className="h-16 w-auto" />
                    </button>
                    <div className="flex items-center">
                        <div className="text-right mr-4">
                             <p className="font-semibold text-brand-dark-blue">{userProfile.role}</p>
                             <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                        <button onClick={logoutUser} className="bg-brand-gray hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg">Çıkış Yap</button>
                    </div>
                </div>
            </header>
            <main className="py-10">
                 <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Araç Servis Geçmişi Sorgulama</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">Plaka ile Sorgula</label>
                            <div className="flex"><input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="34 ABC 123" className="flex-grow p-3 border rounded-l-lg" /><button onClick={() => handleSearch('plate')} className="bg-brand-dark-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-r-lg">Sorgula</button></div>
                        </div>
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">Şasi No (VIN) ile Sorgula</label>
                             <div className="flex"><input type="text" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="VIN123456789" className="flex-grow p-3 border rounded-l-lg" /><button onClick={() => handleSearch('vin')} className="bg-brand-dark-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-r-lg">Sorgula</button></div>
                        </div>
                    </div>

                    {loading && <p className="text-center">Yükleniyor...</p>}
                    {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

                    {searchResult && (
                        <div className="mt-8 animate-fade-in">
                            <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Araç Bilgileri</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p><strong>Plaka:</strong> {searchResult.vehicle.plate}</p>
                                    <p><strong>Şasi No:</strong> {searchResult.vehicle.vin}</p>
                                    <p><strong>Marka:</strong> {searchResult.vehicle.brand}</p>
                                    <p><strong>Model:</strong> {searchResult.vehicle.model}</p>
                                    <p><strong>Sınıf:</strong> {searchResult.vehicle.category}</p>
                                    <p><strong>Motor:</strong> {searchResult.vehicle.engine}</p>
                                    <p><strong>Paket:</strong> {searchResult.vehicle.pkg}</p>
                                    {searchResult.vehicle.purchaseLocation && (
                                        <p className="col-span-full"><strong>Alındığı Yer:</strong> {searchResult.vehicle.purchaseLocation} {searchResult.vehicle.isVerifiedPurchase && '✅'}</p>
                                    )}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Servis Kayıtları ({searchResult.records.length} adet)</h3>
                                <ul className="space-y-4">{searchResult.records.map(renderRecord)}</ul>
                            </div>
                        </div>
                    )}
                </div>
                 {selectedRecord && <AccidentDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
            </main>
        </div>
    );
}
export default BuyerDashboard;

