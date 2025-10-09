import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { vehicleData } from './vehicleData.js';
import { maintenanceData } from './maintenanceData.js';
import { officialData } from './officialData.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const decodeVin_simulated = (vin, authorizedBrands = []) => {
    const getBrandPool = () => {
        if (authorizedBrands && authorizedBrands.length > 0) {
            const availableData = {};
            Object.keys(vehicleData).forEach(category => {
                Object.keys(vehicleData[category]).forEach(brand => {
                    if (authorizedBrands.includes(brand)) {
                        if (!availableData[category]) {
                            availableData[category] = {};
                        }
                        availableData[category][brand] = vehicleData[category][brand];
                    }
                });
            });
            return Object.keys(availableData).length > 0 ? availableData : vehicleData;
        }
        return vehicleData;
    };

    const brandPool = getBrandPool();
    const categories = Object.keys(brandPool);
    if (categories.length === 0) return null;

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const brands = Object.keys(brandPool[randomCategory]);
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const models = Object.keys(brandPool[randomCategory][randomBrand]);
    const randomModel = models[Math.floor(Math.random() * models.length)];
    const engines = Object.keys(brandPool[randomCategory][randomBrand][randomModel]);
    const randomEngine = engines[Math.floor(Math.random() * engines.length)];
    const packages = brandPool[randomCategory][randomBrand][randomModel][randomEngine];
    const randomPackage = packages[Math.floor(Math.random() * packages.length)];

    return {
        vin: vin.toUpperCase().trim(),
        category: randomCategory, brand: randomBrand, model: randomModel,
        engine: randomEngine, pkg: randomPackage,
    };
};

export const getVehicleByVin = async (vin, userProfile) => {
    const upperVin = vin.toUpperCase().trim();
    const vehicleQuery = query(collection(db, "vehicles"), where("vin", "==", upperVin));
    const vehicleSnapshot = await getDocs(vehicleQuery);

    if (!vehicleSnapshot.empty) {
        return { id: vehicleSnapshot.docs[0].id, ...vehicleSnapshot.docs[0].data() };
    } else {
        return decodeVin_simulated(upperVin, userProfile?.brands);
    }
};

export const registerUser = async (email, password, profileData) => {
    if (profileData.role === 'Galeri Sahibi' || profileData.role === 'Servis') {
        const list = profileData.role === 'Galeri Sahibi' ? officialData.showrooms : officialData.services;
        const selectedBusiness = list.find(b => b.name === profileData.businessName);

        if (!selectedBusiness || selectedBusiness.taxId !== profileData.taxNumber) {
            throw { code: 'auth/invalid-tax-id', message: 'Vergi Numarası, seçilen işletme ile uyuşmuyor.' };
        }
        profileData.verified = true;
        profileData.brands = selectedBusiness.brands;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), { uid: user.uid, ...profileData, createdAt: new Date() });
    return userCredential;
};

export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
export const getUserProfile = async (uid) => {
    if (!uid) return null;
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data() : null;
};

export { vehicleData, maintenanceData, officialData };

export async function addVehicle(vehicle, userProfile) {
    try {
        await addDoc(collection(db, "vehicles"), {
            ...vehicle,
            plate: vehicle.plate.toUpperCase().trim(),
            vin: vehicle.vin.toUpperCase().trim(),
            ownerId: userProfile.uid,
            purchaseLocation: userProfile.businessName, 
            isVerifiedPurchase: userProfile.verified || false,
            createdAt: new Date()
        });
    } catch (e) { console.error("Araç eklenirken hata: ", e); }
}

export async function getVehiclesForUser(userId) {
    if (!userId) return [];
    const q = query(collection(db, "vehicles"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    const vehicles = [];
    querySnapshot.forEach((doc) => vehicles.push({ id: doc.id, ...doc.data() }));
    return vehicles;
}

export async function addServiceRecord(record, userProfile) {
     try {
        await addDoc(collection(db, "records"), { 
            ...record,
            plate: record.plate.toUpperCase().trim(),
            vin: record.vin.toUpperCase().trim(),
            serviceProviderId: userProfile.uid,
            serviceProviderName: userProfile.businessName,
            isVerifiedService: userProfile.verified || false,
            createdAt: new Date() 
        });
    } catch (e) { console.error("Servis kaydı eklenirken hata:", e); }
}

export async function getServiceRecordsByPlate(plate) {
     const upperPlate = plate.toUpperCase().trim();
     const recordsQuery = query(collection(db, "records"), where("plate", "==", upperPlate));
     const recordsSnapshot = await getDocs(recordsQuery);
     const records = [];
     recordsSnapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() }));
    
    const vehicleQuery = query(collection(db, "vehicles"), where("plate", "==", upperPlate));
    const vehicleSnapshot = await getDocs(vehicleQuery);
    const vehicle = vehicleSnapshot.docs.length > 0 ? {id: vehicleSnapshot.docs[0].id, ...vehicleSnapshot.docs[0].data()} : null;

    return { vehicle, records: records.sort((a, b) => new Date(b.date) - new Date(a.date)) };
}

export async function getServiceRecordsByVin(vin) {
     const upperVin = vin.toUpperCase().trim();
     const recordsQuery = query(collection(db, "records"), where("vin", "==", upperVin));
     const recordsSnapshot = await getDocs(recordsQuery);
     const records = [];
     recordsSnapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() }));
    
    const vehicleQuery = query(collection(db, "vehicles"), where("vin", "==", upperVin));
    const vehicleSnapshot = await getDocs(vehicleQuery);
    const vehicle = vehicleSnapshot.docs.length > 0 ? {id: vehicleSnapshot.docs[0].id, ...vehicleSnapshot.docs[0].data()} : null;

    return { vehicle, records: records.sort((a, b) => new Date(b.date) - new Date(a.date)) };
}

