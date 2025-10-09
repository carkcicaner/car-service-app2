import React, { useState, useEffect } from 'react';
import { getVehicleByVin, addServiceRecord, logoutUser, maintenanceData } from '../api.js';

function ServiceDashboard({ user, userProfile }) {
    const [vinInput, setVinInput] = useState('');
    const [foundVehicle, setFoundVehicle] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [record, setRecord] = useState({
        plate: '', mileage: '', date: new Date().toISOString().split('T')[0], type: 'Bakım', maintenanceType: '', partsChanged: '', accidentDescription: '', partsReplaced: '', partsPainted: '', airbagDeployed: false, totalCost: '', tramer: '', invoicePhoto: null
    });
    const [selectedTasks, setSelectedTasks] = useState([]);

    const maintenanceTypes = foundVehicle?.category ? Object.keys(maintenanceData[foundVehicle.category] || maintenanceData["Diğer"]) : [];
    const tasksForSelectedType = record.maintenanceType ? (maintenanceData[foundVehicle.category] || maintenanceData["Diğer"])[record.maintenanceType] : [];
    
    useEffect(() => {
        setRecord(prev => ({ ...prev, partsChanged: selectedTasks.join(', ') }));
    }, [selectedTasks]);

    const handleVinSearch = async () => {
        if (!vinInput) return;
        setIsLoading(true);
        setMessage('');
        const vehicleDetails = await getVehicleByVin(vinInput, userProfile);
        setFoundVehicle(vehicleDetails);
        setRecord(prev => ({
            ...prev,
            vin: vehicleDetails.vin,
            category: vehicleDetails.category,
            brand: vehicleDetails.brand,
            model: vehicleDetails.model,
            plate: vehicleDetails.plate || '',
        }));
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRecord(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'maintenanceType') { setSelectedTasks([]); }
            return updated;
        });
    };
    
    const handleTaskChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedTasks(prev => [...prev, value]);
        } else {
            setSelectedTasks(prev => prev.filter(task => task !== value));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setRecord(prev => ({ ...prev, invoicePhoto: canvas.toDataURL(file.type) }));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foundVehicle) {
            setMessage({ type: 'error', text: 'Lütfen önce bir Şasi No sorgulayın.' });
            return;
        }
        await addServiceRecord(record, userProfile);
        setMessage({ type: 'success', text: `Servis kaydı (${record.plate}) başarıyla eklendi.` });
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
                            <p className="font-semibold text-brand-dark-blue">{userProfile.businessName}</p>
                            <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                        <button onClick={logoutUser} className="bg-brand-gray hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg">Çıkış Yap</button>
                    </div>
                </div>
            </header>
            <main className="py-10">
                 <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Yeni Servis Kaydı Ekle (VIN ile)</h2>
                    <div className="space-y-4 mb-6">
                        <label className="block text-sm font-medium text-gray-700">Şasi Numarası (VIN)</label>
                        <div className="flex">
                            <input type="text" value={vinInput} onChange={(e) => setVinInput(e.target.value)} className="flex-grow p-3 border rounded-l-lg" placeholder="17 haneli Şasi No'yu girin"/>
                            <button onClick={handleVinSearch} disabled={isLoading} className="bg-brand-dark-blue text-white font-bold p-3 rounded-r-lg disabled:bg-gray-400">
                                {isLoading ? '...' : 'Aracı Bul'}
                            </button>
                        </div>
                    </div>
                    
                    {foundVehicle && (
                        <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6 animate-fade-in">
                             <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">Araç Bilgileri</h3>
                                <p><strong>Marka:</strong> {foundVehicle.brand} | <strong>Model:</strong> {foundVehicle.model}</p>
                                <p className="mt-1 text-sm text-gray-600"><strong>VIN:</strong> {foundVehicle.vin}</p>
                            </div>
                            <fieldset className="border p-4 rounded-lg space-y-4">
                               <legend className="text-lg font-semibold px-2">Kayıt Detayları</legend>
                                <input type="text" name="plate" value={record.plate} onChange={handleChange} placeholder="Plaka*" required className="w-full p-3 border rounded-lg" />
                                <input type="date" name="date" value={record.date} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                                <input type="number" name="mileage" value={record.mileage} onChange={handleChange} placeholder="Araç Kilometresi*" required className="w-full p-3 border rounded-lg" />
                                <div className="flex items-center space-x-4 pt-2">
                                    <label className="flex items-center"><input type="radio" name="type" value="Bakım" checked={record.type === 'Bakım'} onChange={handleChange} /> <span className="ml-2">Bakım</span></label>
                                    <label className="flex items-center"><input type="radio" name="type" value="Kaza" checked={record.type === 'Kaza'} onChange={handleChange} /> <span className="ml-2">Kaza</span></label>
                                </div>
                            </fieldset>
                            
                            {record.type === 'Bakım' && (
                                <fieldset className="border p-4 rounded-lg bg-gray-50 space-y-4">
                                    <legend className="text-lg font-semibold px-2">Bakım Detayları</legend>
                                    <select name="maintenanceType" value={record.maintenanceType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-100"><option value="">Bakım Türü Seçin</option>{maintenanceTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                    {tasksForSelectedType.length > 0 && (
                                        <div className="p-4 border rounded-lg bg-white">
                                            <h4 className="font-semibold mb-2">Yapılan İşlemler</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                                {tasksForSelectedType.map(task => (
                                                    <label key={task} className="flex items-center text-sm"><input type="checkbox" value={task} checked={selectedTasks.includes(task)} onChange={handleTaskChange} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>{task}</label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <input type="text" name="partsChanged" value={record.partsChanged} onChange={handleChange} placeholder="Değişen Parçalar (Otomatik doldurulur)" readOnly className="w-full p-3 border rounded-lg bg-gray-200" />
                                </fieldset>
                            )}
                             {record.type === 'Kaza' && (
                                <fieldset className="border p-4 rounded-lg bg-red-50 space-y-4">
                                    <legend className="text-lg font-semibold px-2 text-red-800">Kaza Detayları</legend>
                                    <textarea name="accidentDescription" value={record.accidentDescription} onChange={handleChange} rows="2" placeholder="Kaza Açıklaması" className="w-full p-3 border rounded-lg"></textarea>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" name="partsReplaced" value={record.partsReplaced} onChange={handleChange} placeholder="Değişen Parçalar" className="w-full p-3 border rounded-lg" />
                                        <input type="text" name="partsPainted" value={record.partsPainted} onChange={handleChange} placeholder="Boyanan Parçalar" className="w-full p-3 border rounded-lg" />
                                        <input type="number" name="totalCost" value={record.totalCost} onChange={handleChange} placeholder="Toplam Maliyet (TL)" className="w-full p-3 border rounded-lg" />
                                        <input type="text" name="tramer" value={record.tramer} onChange={handleChange} placeholder="Tramer Notu" className="w-full p-3 border rounded-lg" />
                                    </div>
                                    <div className="flex items-start"><div className="flex items-center h-5"><input id="airbag" name="airbagDeployed" type="checkbox" checked={record.airbagDeployed} onChange={handleChange} className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded" /></div><div className="ml-3 text-sm"><label htmlFor="airbag" className="font-medium text-gray-700">Airbag Açıldı mı?</label></div></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Fatura / Fotoğraf Yükle</label><input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/></div>
                                </fieldset>
                            )}
                            <button type="submit" className="w-full bg-brand-light-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg">Servis Kaydını Ekle</button>
                        </form>
                    )}
                    {message && <p className={`mt-4 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</p>}
                 </div>
            </main>
        </div>
    );
}
export default ServiceDashboard;

