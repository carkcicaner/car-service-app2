import React, { useState, useEffect } from 'react';
import { addServiceRecord, getVehicleData } from '../api.js';

function ServicePanel() {
    const [record, setRecord] = useState({
        brand: '',
        model: '',
        plate: '',
        vin: '',
        mileage: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Bakım',
        // Bakım
        maintenanceType: '',
        partsChanged: '',
        // Kaza
        accidentDescription: '',
        partsReplaced: '',
        partsPainted: '',
        airbagDeployed: false,
        totalCost: '',
        tramer: '',
        invoicePhoto: null
    });
    const [message, setMessage] = useState('');
    const [vehicleData, setVehicleData] = useState({ brands: [], models: {} });
    
    useEffect(() => {
        const data = getVehicleData();
        const brands = Object.keys(data);
        setVehicleData({ brands, models: data });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === "brand") {
             setRecord(prev => ({ ...prev, brand: value, model: '' }));
        } else {
             setRecord(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            // Basit bir yeniden boyutlandırma ekleyelim
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL(file.type);
                setRecord(prev => ({ ...prev, invoicePhoto: dataUrl }));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addServiceRecord(record);
        setMessage({ type: 'success', text: `Servis kaydı (${record.plate}) başarıyla eklendi.` });
        // Formu sıfırlama (isteğe bağlı)
    };

    const availableModels = record.brand ? vehicleData.models[record.brand] || [] : [];

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">🛠️ Servis Paneli - Yeni Kayıt Ekle</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-semibold px-2">Araç Bilgileri</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marka</label>
                            <select name="brand" value={record.brand} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                                <option value="">Marka Seçin</option>
                                {vehicleData.brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <select name="model" value={record.model} onChange={handleChange} disabled={!record.brand} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100">
                                <option value="">Model Seçin</option>
                                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plaka</label>
                            <input type="text" name="plate" value={record.plate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="34 ABC 123" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kilometre</label>
                            <input type="number" name="mileage" value={record.mileage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="95000" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-semibold px-2">Kayıt Detayları</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kayıt Tarihi</label>
                        <input type="date" name="date" value={record.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Kayıt Türü</label>
                        <div className="flex items-center space-x-4 mt-1">
                            <label className="flex items-center"><input type="radio" name="type" value="Bakım" checked={record.type === 'Bakım'} onChange={handleChange} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300" /> <span className="ml-2">Bakım</span></label>
                            <label className="flex items-center"><input type="radio" name="type" value="Kaza" checked={record.type === 'Kaza'} onChange={handleChange} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300" /> <span className="ml-2">Kaza</span></label>
                        </div>
                    </div>
                </fieldset>

                {record.type === 'Bakım' && (
                    <fieldset className="border p-4 rounded-lg bg-gray-50">
                        <legend className="text-lg font-semibold px-2">Bakım Detayları</legend>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bakım Türü</label>
                                <input type="text" name="maintenanceType" value={record.maintenanceType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Periyodik Bakım" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Değişen Parçalar (virgülle ayırın)</label>
                                <input type="text" name="partsChanged" value={record.partsChanged} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Yağ filtresi, hava filtresi" />
                            </div>
                        </div>
                    </fieldset>
                )}

                 {record.type === 'Kaza' && (
                    <fieldset className="border p-4 rounded-lg bg-red-50">
                        <legend className="text-lg font-semibold px-2 text-red-800">Kaza Detayları</legend>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Kaza Açıklaması</label>
                                <textarea name="accidentDescription" value={record.accidentDescription} onChange={handleChange} rows="2" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" placeholder="Sağ ön çamurlukta hasar"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Değişen Parçalar (virgülle ayırın)</label>
                                    <input type="text" name="partsReplaced" value={record.partsReplaced} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Boyanan Parçalar (virgülle ayırın)</label>
                                    <input type="text" name="partsPainted" value={record.partsPainted} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Toplam Maliyet (TL)</label>
                                    <input type="number" name="totalCost" value={record.totalCost} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Tramer Notu</label>
                                    <input type="text" name="tramer" value={record.tramer} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" placeholder="5.500 TL Hasar Kaydı" />
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="airbag" name="airbagDeployed" type="checkbox" checked={record.airbagDeployed} onChange={handleChange} className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="airbag" className="font-medium text-gray-700">Airbag Açıldı mı?</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fatura / Fotoğraf Yükle</label>
                                <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                            </div>
                        </div>
                    </fieldset>
                )}

                 <div className="pt-4">
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors">
                        Servis Kaydını Ekle
                    </button>
                </div>
            </form>
             {message && (
                <div className={`mt-6 p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default ServicePanel;

