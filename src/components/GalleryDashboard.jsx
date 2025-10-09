import React, { useState, useEffect } from 'react';
import { getVehicleByVin, addVehicle, getVehiclesForUser, logoutUser } from '../api.js';

function GalleryDashboard({ user, userProfile }) {
    const [vehicles, setVehicles] = useState([]);
    const [vinInput, setVinInput] = useState('');
    const [foundVehicle, setFoundVehicle] = useState(null);
    const [plate, setPlate] = useState('');
    const [km, setKm] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            getVehiclesForUser(user.uid).then(setVehicles);
        }
    }, [user]);

    const handleVinSearch = async () => {
        if (!vinInput) return;
        setIsLoading(true);
        setMessage('');
        const vehicleDetails = await getVehicleByVin(vinInput, userProfile);
        
        if (userProfile.brands && !userProfile.brands.includes(vehicleDetails.brand)) {
            setMessage({ type: 'error', text: `Bu aracı ekleme yetkiniz yok. Sadece (${userProfile.brands.join(', ')}) markalarını ekleyebilirsiniz.` });
            setFoundVehicle(null);
            setIsLoading(false);
            return;
        }

        setFoundVehicle(vehicleDetails);
        if (vehicleDetails.id) {
            setPlate(vehicleDetails.plate || '');
            setKm(vehicleDetails.km || '');
        } else {
             setPlate(''); setKm('');
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foundVehicle || !plate) {
            setMessage({ type: 'error', text: 'Lütfen önce bir Şasi No sorgulayın ve Plaka girin.' });
            return;
        }
        if (foundVehicle.id) {
             setMessage({ type: 'error', text: 'Bu araç zaten envanterinizde mevcut.' });
             return;
        }
        const vehicleToSave = { ...foundVehicle, plate, km };
        await addVehicle(vehicleToSave, userProfile);
        setMessage({ type: 'success', text: `Araç (${plate}) başarıyla envantere eklendi.` });
        setVinInput('');
        setFoundVehicle(null);
        setPlate('');
        setKm('');
        getVehiclesForUser(user.uid).then(setVehicles);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <button onClick={logoutUser} title="Oturumu Kapat">
                        <img src="/logo.svg" alt="OtoSicil Logo" className="h-16 w-auto" />
                    </button>
                    <div className="flex items-center">
                        <div className="text-right mr-4">
                            <p className="font-semibold text-brand-dark-blue">{userProfile.businessName || userProfile.role}</p>
                            <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                        <button onClick={logoutUser} className="bg-brand-gray hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg">Çıkış Yap</button>
                    </div>
                </div>
            </header>
            <main className="py-10">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Yeni Araç Ekle (VIN ile)</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Şasi Numarası (VIN)</label>
                                <div className="flex mt-1">
                                    <input type="text" value={vinInput} onChange={(e) => setVinInput(e.target.value)} className="flex-grow p-3 border rounded-l-lg" placeholder="17 haneli Şasi No'yu girin"/>
                                    <button onClick={handleVinSearch} disabled={isLoading} className="bg-brand-dark-blue text-white font-bold p-3 rounded-r-lg disabled:bg-gray-400">
                                        {isLoading ? '...' : 'Getir'}
                                    </button>
                                </div>
                            </div>

                            {foundVehicle && (
                                <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-6 animate-fade-in">
                                    <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-x-6 gap-y-2">
                                        <p className="text-sm"><strong>Marka:</strong> {foundVehicle.brand}</p>
                                        <p className="text-sm"><strong>Model:</strong> {foundVehicle.model}</p>
                                        <p className="text-sm col-span-2"><strong>Motor/Paket:</strong> {foundVehicle.engine} - {foundVehicle.pkg}</p>
                                    </div>
                                     <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="Plaka*" required className="w-full p-3 border rounded-lg" />
                                     <input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="Kilometre" className="w-full p-3 border rounded-lg" />
                                    <button type="submit" disabled={foundVehicle.id} className="w-full bg-brand-light-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {foundVehicle.id ? 'Araç Zaten Kayıtlı' : 'Aracı Envantere Ekle'}
                                    </button>
                                </form>
                            )}
                             {message && <p className={`mt-4 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</p>}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Envanterdeki Araçlarım ({vehicles.length})</h2>
                        <ul className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
                            {vehicles.map(v => (
                                <li key={v.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="font-bold">{v.plate} - {v.brand} {v.model}</p>
                                    <p className="text-sm text-gray-500 mt-1">VIN: {v.vin}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                 </div>
            </main>
        </div>
    );
}
export default GalleryDashboard;

