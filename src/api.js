// --- Veritabanı ve Test Verisi Yönetimi ---
const DB_KEY = "otoRaporDB_v3"; // Hataları önlemek için versiyonu güncelledik

// Statik plaka listesi
const staticPlates = [
    "34 ABC 123", "06 XYZ 456", "35 KML 789", "16 RTY 101", "01 FGH 234",
    "27 PLM 567", "58 VBN 890", "33 ASD 112", "41 JKL 334", "07 ZXC 556",
    "61 GHJ 778", "38 QWE 990", "10 VFR 246", "42 BNM 802", "03 CDE 159"
];

// Marka ve model verisi
const vehicleData = {
    "Toyota": ["Corolla", "Yaris", "RAV4"],
    "Ford": ["Focus", "Fiesta", "Puma"],
    "Volkswagen": ["Golf", "Passat", "Polo"],
    "Renault": ["Clio", "Megane", "Captur"],
    "Fiat": ["Egea", "500", "Panda"],
};

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateInitialData() {
    console.log("İlk test verisi oluşturuluyor...");
    const vehicles = staticPlates.map((plate, index) => {
        const brand = getRandomItem(Object.keys(vehicleData));
        const model = getRandomItem(vehicleData[brand]);
        return {
            id: index + 1,
            plate: plate,
            vin: `VIN${plate.replace(/\s/g, '')}`,
            brand: brand,
            model: model,
            km: Math.floor(Math.random() * 150000) + 20000,
            purchaseLocation: getRandomItem(["Bayiden Sıfır", "Sahibinden", "Galeriden"])
        };
    });

    const records = [];
    vehicles.forEach(vehicle => {
        let recordCount = Math.floor(Math.random() * 2) + 3; // Her araca 3-4 kayıt
        let lastKm = vehicle.km - (recordCount * (Math.floor(Math.random() * 5000) + 10000));
        let lastDate = new Date();
        lastDate.setFullYear(lastDate.getFullYear() - 2);

        for (let i = 0; i < recordCount; i++) {
            lastKm += Math.floor(Math.random() * 8000) + 5000;
            lastDate.setMonth(lastDate.getMonth() + (Math.floor(Math.random() * 6) + 3));
            
            const isAccident = Math.random() > 0.7; // %30 ihtimalle kaza
            if (isAccident) {
                const cost = (Math.floor(Math.random() * 10) + 2) * 1000;
                records.push({
                    id: `rec_${Date.now()}_${records.length}`,
                    plate: vehicle.plate,
                    vin: vehicle.vin,
                    mileage: lastKm,
                    date: lastDate.toISOString().split('T')[0],
                    type: 'Kaza',
                    accidentDescription: getRandomItem(["Park halinde çarpma", "Öndeki araca çarpma", "Zincirleme kaza"]),
                    partsReplaced: getRandomItem(["Ön tampon", "Sol far"]),
                    partsPainted: getRandomItem(["Sağ ön çamurluk", "Kaput"]),
                    airbagDeployed: Math.random() > 0.8,
                    totalCost: cost,
                    tramer: `${cost.toLocaleString('tr-TR')} TL Hasar Kaydı`,
                    invoicePhoto: null
                });
            } else {
                records.push({
                    id: `rec_${Date.now()}_${records.length}`,
                    plate: vehicle.plate,
                    vin: vehicle.vin,
                    mileage: lastKm,
                    date: lastDate.toISOString().split('T')[0],
                    type: 'Bakım',
                    maintenanceType: 'Periyodik Bakım',
                    partsChanged: 'Yağ filtresi, Hava filtresi, Motor yağı',
                });
            }
        }
    });

    return { vehicles, records };
}


function loadDB() {
    let db = JSON.parse(localStorage.getItem(DB_KEY));
    if (!db || !db.vehicles || db.vehicles.length === 0) {
        db = generateInitialData();
        saveDB(db);
    }
    return db;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// --- API Fonksiyonları ---

export function getVehicleData() {
    return vehicleData;
}

export function addVehicle(vehicle) {
    const db = loadDB();
    const newVehicle = { id: Date.now(), ...vehicle };
    db.vehicles.push(newVehicle);
    saveDB(db);
}

export function addServiceRecord(record) {
    const db = loadDB();
    const newRecord = { id: `rec_${Date.now()}`, ...record };
    db.records.push(newRecord);

    // Aracın son KM'sini güncelle
    const vehicleIndex = db.vehicles.findIndex(v => v.plate === record.plate || v.vin === record.vin);
    if (vehicleIndex !== -1 && db.vehicles[vehicleIndex].km < record.mileage) {
        db.vehicles[vehicleIndex].km = record.mileage;
    }

    saveDB(db);
}

// BU FONKSİYONLAR EKLENDİ
export function getServiceRecordsByPlate(plate) {
    const db = loadDB();
    const vehicle = db.vehicles.find(v => v.plate.toLowerCase() === plate.toLowerCase());
    if (!vehicle) {
        return { vehicle: null, records: [] };
    }
    const records = db.records.filter(r => r.plate.toLowerCase() === plate.toLowerCase())
                              .sort((a, b) => new Date(b.date) - new Date(a.date));
    return { vehicle, records };
}

export function getServiceRecordsByVin(vin) {
    const db = loadDB();
    const vehicle = db.vehicles.find(v => v.vin.toLowerCase() === vin.toLowerCase());
    if (!vehicle) {
        return { vehicle: null, records: [] };
    }
    const records = db.records.filter(r => r.vin.toLowerCase() === vin.toLowerCase())
                              .sort((a, b) => new Date(b.date) - new Date(a.date));
    return { vehicle, records };
}

