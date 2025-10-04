import React, { useState } from 'react';
import { getServiceRecordsByPlate, getServiceRecordsByVin } from '../api.js';
import AccidentDetailModal from './AccidentDetailModal.jsx';

function BuyerPanel() {
    const [plate, setPlate] = useState('');
    const [vin, setVin] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleSearch = async (type) => {
        setLoading(true);
        setError('');
        setSearchResult(null);

        const query = type === 'plate' ? plate : vin;
        if (!query) {
            setError('Lütfen bir plaka veya şasi numarası girin.');
            setLoading(false);
            return;
        }

        const result = type === 'plate' 
            ? getServiceRecordsByPlate(query) 
            : getServiceRecordsByVin(query);

        if (result.vehicle) {
            setSearchResult(result);
        } else {
            setError('Bu kritere uygun araç bulunamadı veya hiç servis kaydı yok.');
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
                        <p className="text-sm text-gray-600">Tarih: {new Date(record.date).toLocaleDateString('tr-TR')}</p>
                        <p className="text-sm text-gray-600">Kilometre: {record.mileage.toLocaleString('tr-TR')} km</p>
                    </div>
                     {isAccident && (
                        <button 
                            onClick={() => setSelectedRecord(record)}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition-colors"
                        >
                            Detayları Gör
                        </button>
                    )}
                </div>
                 <div className="mt-3 pt-3 border-t border-dashed">
                    {isAccident ? (
                        <p><strong className="font-medium">Açıklama:</strong> {record.accidentDescription}</p>
                    ) : (
                        <>
                            <p><strong className="font-medium">Bakım Türü:</strong> {record.maintenanceType}</p>
                            <p><strong className="font-medium">Değişen Parçalar:</strong> {record.partsChanged}</p>
                        </>
                    )}
                </div>
            </li>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">👤 Alıcı Paneli - Araç Servis Geçmişi Sorgulama</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Plaka ile Sorgula</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            placeholder="34 ABC 123"
                            className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button onClick={() => handleSearch('plate')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r-md">
                            Sorgula
                        </button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Şasi No (VIN) ile Sorgula</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={vin}
                            onChange={(e) => setVin(e.target.value.toUpperCase())}
                            placeholder="VIN123456789"
                            className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button onClick={() => handleSearch('vin')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r-md">
                            Sorgula
                        </button>
                    </div>
                </div>
            </div>

            {loading && <p className="text-center text-gray-600">Yükleniyor...</p>}
            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

            {searchResult && (
                <div className="mt-8">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Araç Bilgileri</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <p><strong>Plaka:</strong> {searchResult.vehicle.plate}</p>
                            <p><strong>Şasi No:</strong> {searchResult.vehicle.vin}</p>
                            <p><strong>Marka:</strong> {searchResult.vehicle.brand}</p>
                            <p><strong>Model:</strong> {searchResult.vehicle.model}</p>
                            <p><strong>Son Bilinen KM:</strong> {searchResult.vehicle.km.toLocaleString('tr-TR')}</p>
                            <p><strong>Alındığı Yer:</strong> {searchResult.vehicle.purchaseLocation}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Servis Kayıtları ({searchResult.records.length} adet)</h3>
                        <ul className="space-y-4">
                            {searchResult.records.map(renderRecord)}
                        </ul>
                    </div>
                </div>
            )}
            
            {selectedRecord && (
                <AccidentDetailModal 
                    record={selectedRecord} 
                    onClose={() => setSelectedRecord(null)} 
                />
            )}
        </div>
    );
}

export default BuyerPanel;

