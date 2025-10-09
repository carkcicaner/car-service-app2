import React, { useState } from 'react';
import { registerUser, loginUser, officialData } from '../api.js';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [role, setRole] = useState('Alıcı');
    const [businessName, setBusinessName] = useState('');
    const [taxNumber, setTaxNumber] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isLogin) {
                await loginUser(email, password);
            } else {
                const profileData = { email, role };
                if (role === 'Galeri Sahibi' || role === 'Servis') {
                    profileData.businessName = businessName;
                    profileData.taxNumber = taxNumber;
                }
                if (role === 'Servis') {
                    profileData.serviceType = serviceType;
                }
                await registerUser(email, password, profileData);
            }
        } catch (err) {
            let friendlyMessage = "Bir hata oluştu.";
             if (err.code) { 
                switch(err.code) {
                    case 'auth/wrong-password': friendlyMessage = "Hatalı şifre."; break;
                    case 'auth/user-not-found': friendlyMessage = "Kullanıcı bulunamadı."; break;
                    case 'auth/email-already-in-use': friendlyMessage = "Bu e-posta zaten kullanılıyor."; break;
                    case 'auth/invalid-email': friendlyMessage = "Geçersiz e-posta adresi."; break;
                    case 'auth/weak-password': friendlyMessage = "Şifre en az 6 karakter olmalıdır."; break;
                    case 'auth/invalid-tax-id': friendlyMessage = "Vergi Numarası, seçilen işletme ile uyuşmuyor."; break;
                    default: friendlyMessage = "İşlem başarısız: " + err.message;
                }
            }
            setError(friendlyMessage);
        }
        setIsLoading(false);
    };
    
    const businessList = role === 'Galeri Sahibi' ? officialData.showrooms : officialData.services;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="mb-10">
                <img src="/logo.svg" alt="OtoSicil Logo" className="h-40 w-auto"/>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-brand-dark-blue mb-6">
                    {isLogin ? 'Sisteme Giriş Yap' : 'Yeni Hesap Oluştur'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Şifre</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg" />
                    </div>

                    {!isLogin && (
                        <div className="space-y-4 pt-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Kullanıcı Rolü</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full p-3 border rounded-lg bg-white">
                                    <option>Alıcı</option>
                                    <option>Bireysel Satıcı</option>
                                    <option>Galeri Sahibi</option>
                                    <option>Servis</option>
                                </select>
                            </div>
                            {(role === 'Galeri Sahibi' || role === 'Servis') && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{role} Adı</label>
                                        <select value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg bg-white">
                                            <option value="">İşletmenizi Seçin</option>
                                            {businessList.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                                        <input type="text" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg" />
                                    </div>
                                </>
                            )}
                             {role === 'Servis' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Servis Türü</label>
                                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg bg-white">
                                        <option value="">Lütfen Seçin</option>
                                        <option>Yetkili Servis</option>
                                        <option>Özel Servis</option>
                                        <option>Sanayi</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-dark-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                        {isLoading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
                    </button>
                     <div className="text-center mt-4">
                        <button type="button" disabled={isLoading} onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-brand-light-blue hover:underline disabled:text-gray-400">
                            {isLogin ? 'Hesabın yok mu? Kayıt ol.' : 'Zaten hesabın var mı? Giriş yap.'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Auth;

