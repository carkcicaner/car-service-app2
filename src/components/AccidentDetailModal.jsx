import React from 'react';

function AccidentDetailModal({ record, onClose }) {
    if (!record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h3 className="text-xl font-bold text-red-800">💥 Kaza Detay Raporu</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p><strong>Tarih:</strong> {new Date(record.date).toLocaleDateString('tr-TR')}</p>
                        <p><strong>Kilometre:</strong> {record.mileage.toLocaleString('tr-TR')} km</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700">Açıklama:</p>
                        <p>{record.accidentDescription || "Belirtilmemiş"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold text-gray-700">Değişen Parçalar:</p>
                            <p>{record.partsReplaced || "Yok"}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">Boyanan Parçalar:</p>
                            <p>{record.partsPainted || "Yok"}</p>
                        </div>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-700">Airbag Durumu:</p>
                        <p className={record.airbagDeployed ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                            {record.airbagDeployed ? 'Açıldı' : 'Açılmadı'}
                        </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold text-red-700">Finansal Bilgiler:</p>
                        <p><strong>Toplam Maliyet:</strong> {record.totalCost ? `${record.totalCost.toLocaleString('tr-TR')} TL` : 'Belirtilmemiş'}</p>
                        <p><strong>Tramer/Hasar Kaydı:</strong> {record.tramer || "Belirtilmemiş"}</p>
                    </div>

                    {record.invoicePhoto && (
                        <div>
                            <p className="font-semibold text-gray-700 mb-2">Yüklenen Fotoğraf/Fatura:</p>
                            <img src={record.invoicePhoto} alt="Fatura" className="rounded-lg shadow-md max-h-60 w-auto mx-auto cursor-pointer" onClick={() => window.open(record.invoicePhoto, '_blank')}/>
                        </div>
                    )}
                </div>
                 <div className="mt-6 border-t pt-4">
                    <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Kapat</button>
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
}
export default AccidentDetailModal;

