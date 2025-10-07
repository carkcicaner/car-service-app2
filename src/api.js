import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where,
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";
import { vehicleData } from './vehicleData.js';
import { maintenanceData } from './maintenanceData.js';

// .env.local dosyasından ayarları okuyoruz.
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

console.log("Firebase başarıyla başlatıldı.");

// --- Kimlik Doğrulama Fonksiyonları ---

export const registerUser = async (email, password, profileData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        ...profileData,
        createdAt: new Date()
    });
    
    return userCredential;
};

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
    return signOut(auth);
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid) => {
    if (!uid) return null;
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data();
    } else {
        return null;
    }
};

// --- Veritabanı Fonksiyonları ---

export { vehicleData, maintenanceData };

export async function addVehicle(vehicle, userId) {
    try {
        await addDoc(collection(db, "vehicles"), {
            ...vehicle,
            plate: vehicle.plate.toUpperCase().trim(),
            ownerId: userId,
            createdAt: new Date()
        });
    } catch (e) {
        console.error("Araç eklenirken hata: ", e);
    }
}

export async function getVehiclesForUser(userId) {
    if (!userId) return [];
    const q = query(collection(db, "vehicles"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    const vehicles = [];
    querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() });
    });
    return vehicles;
}

export async function addServiceRecord(record, serviceProviderId) {
     try {
        await addDoc(collection(db, "records"), {
            ...record,
            plate: record.plate.toUpperCase().trim(),
            serviceProviderId: serviceProviderId,
            createdAt: new Date()
        });
    } catch (e) {
        console.error("Servis kaydı eklenirken hata: ", e);
    }
}

export async function getServiceRecordsByPlate(plate) {
    const upperPlate = plate.toUpperCase().trim();
    const q = query(collection(db, "records"), where("plate", "==", upperPlate));
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
    });

    const vehicleQuery = query(collection(db, "vehicles"), where("plate", "==", upperPlate));
    const vehicleSnapshot = await getDocs(vehicleQuery);
    const vehicle = vehicleSnapshot.docs.length > 0 ? {id: vehicleSnapshot.docs[0].id, ...vehicleSnapshot.docs[0].data()} : null;

    return { vehicle, records: records.sort((a, b) => new Date(b.date) - new Date(a.date)) };
}

export async function getServiceRecordsByVin(vin) {
     const upperVin = vin.toUpperCase().trim();
     const q = query(collection(db, "records"), where("vin", "==", upperVin));
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
    });
    
    const vehicleQuery = query(collection(db, "vehicles"), where("vin", "==", upperVin));
    const vehicleSnapshot = await getDocs(vehicleQuery);
    const vehicle = vehicleSnapshot.docs.length > 0 ? {id: vehicleSnapshot.docs[0].id, ...vehicleSnapshot.docs[0].data()} : null;

    return { vehicle, records: records.sort((a, b) => new Date(b.date) - new Date(a.date)) };
}

