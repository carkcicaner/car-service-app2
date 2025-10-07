import React, { useState } from 'react';
import { registerUser, loginUser } from '../api.js';

function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Kayıt form verileri
    const [role, setRole] = useState('Alıcı');
    const [taxNumber, setTaxNumber] = useState('');
    const [serviceType, setServiceType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const userCredential = await loginUser(email, password);
                onLoginSuccess(userCredential.user);
            } else {
                const profileData = { email, role };
                if (role === 'Galeri Sahibi') profileData.taxNumber = taxNumber;
                if (role === 'Servis') profileData.serviceType = serviceType;
                
                const userCredential = await registerUser(email, password, profileData);
                onLoginSuccess(userCredential.user);
            }
        } catch (err) {
            let friendlyMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";
            if (err.code) {
                switch(err.code) {
                    case 'auth/wrong-password': friendlyMessage = "Hatalı şifre. Lütfen tekrar deneyin."; break;
                    case 'auth/user-not-found': friendlyMessage = "Bu e-posta ile kayıtlı bir kullanıcı bulunamadı."; break;
                    case 'auth/email-already-in-use': friendlyMessage = "Bu e-posta adresi zaten kullanılıyor."; break;
                    case 'auth/invalid-email': friendlyMessage = "Lütfen geçerli bir e-posta adresi girin."; break;
                    case 'auth/weak-password': friendlyMessage = "Şifreniz en az 6 karakter olmalıdır."; break;
                    default: friendlyMessage = "Giriş yapılamadı: " + err.message;
                }
            }
            setError(friendlyMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Şifre</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {!isLogin && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kullanıcı Rolü</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                                    <option>Alıcı</option>
                                    <option>Bireysel Satıcı</option>
                                    <option>Galeri Sahibi</option>
                                    <option>Servis</option>
                                </select>
                            </div>
                            {role === 'Galeri Sahibi' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                                    <input type="text" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            )}
                            {role === 'Servis' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Servis Türü</label>
                                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
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
                    
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-blue-600 hover:underline">
                        {isLogin ? 'Hesabın yok mu? Kayıt ol.' : 'Zaten hesabın var mı? Giriş yap.'}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default Auth;

