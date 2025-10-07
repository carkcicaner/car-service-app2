import React, { useState, useEffect } from 'react';
import { addVehicle, getVehiclesForUser, logoutUser, vehicleData } from '../api.js';

function GalleryDashboard({ user, userProfile }) {
    const [vehicles, setVehicles] = useState([]);
    const [newVehicle, setNewVehicle] = useState({
        plate: '', vin: '', category: '', brand: '', model: '', engine: '', pkg: '', km: '', purchaseLocation: ''
    });
    const [message, setMessage] = useState('');

    const categories = Object.keys(vehicleData);
    const brands = newVehicle.category ? Object.keys(vehicleData[newVehicle.category]) : [];
    const models = newVehicle.brand ? Object.keys(vehicleData[newVehicle.category][newVehicle.brand]) : [];
    const engines = newVehicle.model ? Object.keys(vehicleData[newVehicle.category][newVehicle.brand][newVehicle.model]) : [];
    const packages = newVehicle.engine ? vehicleData[newVehicle.category][newVehicle.brand][newVehicle.model][newVehicle.engine] : [];

    useEffect(() => {
        if (user) {
            getVehiclesForUser(user.uid).then(setVehicles);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewVehicle(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'category') { updated.brand = ''; updated.model = ''; updated.engine = ''; updated.pkg = ''; }
            if (name === 'brand') { updated.model = ''; updated.engine = ''; updated.pkg = ''; }
            if (name === 'model') { updated.engine = ''; updated.pkg = ''; }
            if (name === 'engine') { updated.pkg = ''; }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newVehicle.plate || !newVehicle.vin) {
            setMessage({ type: 'error', text: 'Plaka ve Şasi Numarası zorunludur.' });
            return;
        }
        await addVehicle(newVehicle, user.uid);
        setMessage({ type: 'success', text: `Araç (${newVehicle.plate}) başarıyla eklendi.` });
        setNewVehicle({ plate: '', vin: '', category: '', brand: '', model: '', engine: '', pkg: '', km: '', purchaseLocation: '' });
        getVehiclesForUser(user.uid).then(setVehicles);
    };

    const handleLogout = async () => { await logoutUser(); };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">🚗 {userProfile.role} Paneli</h1>
                        <p className="text-sm text-gray-500">{userProfile.email}</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Çıkış Yap</button>
                </div>
            </header>
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Yeni Araç Ekle</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="plate" value={newVehicle.plate} onChange={handleChange} placeholder="Plaka*" required className="w-full p-3 border rounded-lg" />
                                <input type="text" name="vin" value={newVehicle.vin} onChange={handleChange} placeholder="Şasi No (VIN)*" required className="w-full p-3 border rounded-lg" />
                            </div>
                            <select name="category" value={newVehicle.category} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white"><option value="">Araç Sınıfı Seçin</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                            <select name="brand" value={newVehicle.brand} onChange={handleChange} disabled={!newVehicle.category} className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-100"><option value="">Marka Seçin</option>{brands.map(b => <option key={b} value={b}>{b}</option>)}</select>
                            <select name="model" value={newVehicle.model} onChange={handleChange} disabled={!newVehicle.brand} className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-100"><option value="">Model Seçin</option>{models.map(m => <option key={m} value={m}>{m}</option>)}</select>
                            <select name="engine" value={newVehicle.engine} onChange={handleChange} disabled={!newVehicle.model} className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-100"><option value="">Motor Seçin</option>{engines.map(e => <option key={e} value={e}>{e}</option>)}</select>
                            <select name="pkg" value={newVehicle.pkg} onChange={handleChange} disabled={!newVehicle.engine} className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-100"><option value="">Paket Seçin</option>{packages.map(p => <option key={p} value={p}>{p}</option>)}</select>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="number" name="km" value={newVehicle.km} onChange={handleChange} placeholder="Kilometre" className="w-full p-3 border rounded-lg" />
                                <input type="text" name="purchaseLocation" value={newVehicle.purchaseLocation} onChange={handleChange} placeholder="Alındığı Yer" className="w-full p-3 border rounded-lg" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">Aracı Ekle</button>
                            {message && <p className={`p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</p>}
                        </form>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Envanterdeki Araçlarım ({vehicles.length})</h2>
                        <ul className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
                            {vehicles.length > 0 ? vehicles.map(v => (
                                <li key={v.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="font-bold text-gray-800">{v.plate} - {v.brand} {v.model}</p>
                                    <p className="text-sm text-gray-600">{v.engine} - {v.pkg}</p>
                                    <p className="text-sm text-gray-500 mt-1">VIN: {v.vin} | KM: {Number(v.km).toLocaleString('tr-TR')}</p>
                                </li>
                            )) : <p className="text-gray-500">Henüz hiç araç eklemediniz.</p>}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default GalleryDashboard;

