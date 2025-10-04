import React, { useState } from 'react';
import { addVehicle } from '../api.js';

function VehicleOwner() {
    const [plate, setPlate] = useState('');
    const [vin, setVin] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [km, setKm] = useState('');
    const [purchaseLocation, setPurchaseLocation] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!plate || !vin || !brand || !model || !km || !purchaseLocation) {
            setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
            return;
        }

        addVehicle({ plate, vin, brand, model, km: parseInt(km), purchaseLocation });

        setMessage({ type: 'success', text: `Araç (${plate}) başarıyla sisteme eklendi.` });

        // Formu temizle
        setPlate('');
        setVin('');
        setBrand('');
        setModel('');
        setKm('');
        setPurchaseLocation('');
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">🚗 Araç Sahibi Paneli - Yeni Araç Ekle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plaka</label>
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="34 ABC 123"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Şasi Numarası (VIN)</label>
                        <input
                            type="text"
                            value={vin}
                            onChange={(e) => setVin(e.target.value.toUpperCase())}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VIN123456789"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Marka</label>
                        <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ford"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Focus"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kilometre</label>
                        <input
                            type="number"
                            value={km}
                            onChange={(e) => setKm(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="85000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alındığı Yer</label>
                        <input
                            type="text"
                            value={purchaseLocation}
                            onChange={(e) => setPurchaseLocation(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="İlk Sahibi"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors">
                        Aracı Kaydet
                    </button>
                </div>
            </form>
            {message && (
                <div className={`mt-4 p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default VehicleOwner;


