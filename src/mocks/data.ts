import { User, District, Agent, Address, Meter, Reading, Client, MeterType } from '@/types';

// Districts
export const districts: District[] = [
  { id: 'd1', name: 'Agdal' },
  { id: 'd2', name: 'Hassan' },
  { id: 'd3', name: 'Yacoub El Mansour' },
  { id: 'd4', name: 'Souissi' },
  { id: 'd5', name: 'Océan' },
  { id: 'd6', name: 'Akkari' },
  { id: 'd7', name: 'Hay Riad' },
  { id: 'd8', name: 'Témara' },
];

// Users
export const users: User[] = [
  {
    id: 'u1',
    email: 'admin@ree.ma',
    firstName: 'Admin',
    lastName: 'Super',
    role: 'SUPERADMIN',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'user@ree.ma',
    firstName: 'User',
    lastName: 'Standard',
    role: 'USER',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'u3',
    email: 'mohammed.alami@ree.ma',
    firstName: 'Mohammed',
    lastName: 'Alami',
    role: 'USER',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'u4',
    email: 'fatima.benali@ree.ma',
    firstName: 'Fatima',
    lastName: 'Benali',
    role: 'USER',
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-04-05T11:00:00Z',
  },
];

// Clients
export const clients: Client[] = [
  { id: 'c1', externalId: 'EXT-001', name: 'Ahmed Benjelloun' },
  { id: 'c2', externalId: 'EXT-002', name: 'Sara Elhaddad' },
  { id: 'c3', externalId: 'EXT-003', name: 'Youssef Tazi' },
  { id: 'c4', externalId: 'EXT-004', name: 'Nadia Chraibi' },
  { id: 'c5', externalId: 'EXT-005', name: 'Karim Fassi' },
  { id: 'c6', externalId: 'EXT-006', name: 'Zineb Bennani' },
  { id: 'c7', externalId: 'EXT-007', name: 'Omar Kettani' },
  { id: 'c8', externalId: 'EXT-008', name: 'Laila Berrada' },
  { id: 'c9', externalId: 'EXT-009', name: 'Hassan Zouaoui' },
  { id: 'c10', externalId: 'EXT-010', name: 'Amina Sefrioui' },
  { id: 'c11', externalId: 'EXT-011', name: 'Rachid Boutaleb' },
  { id: 'c12', externalId: 'EXT-012', name: 'Khadija Mernissi' },
  { id: 'c13', externalId: 'EXT-013', name: 'Driss Benkiran' },
  { id: 'c14', externalId: 'EXT-014', name: 'Salma Ouazzani' },
  { id: 'c15', externalId: 'EXT-015', name: 'Mehdi Lahlou' },
];

// Agents
export const agents: Agent[] = [
  { id: 'a1', firstName: 'Hamid', lastName: 'Moussaoui', phone: '0661234567', secondaryPhone: '0522123456', districtId: 'd1' },
  { id: 'a2', firstName: 'Khalid', lastName: 'Benjelloun', phone: '0662345678', districtId: 'd2' },
  { id: 'a3', firstName: 'Said', lastName: 'Elbaz', phone: '0663456789', secondaryPhone: '0522234567', districtId: 'd3' },
  { id: 'a4', firstName: 'Rachid', lastName: 'Tahiri', phone: '0664567890', districtId: 'd4' },
  { id: 'a5', firstName: 'Yassine', lastName: 'Berrada', phone: '0665678901', districtId: 'd5' },
  { id: 'a6', firstName: 'Mourad', lastName: 'Cherkaoui', phone: '0666789012', secondaryPhone: '0522345678', districtId: 'd6' },
  { id: 'a7', firstName: 'Abdellatif', lastName: 'Naciri', phone: '0667890123', districtId: 'd7' },
  { id: 'a8', firstName: 'Jamal', lastName: 'Idrissi', phone: '0668901234', districtId: 'd8' },
  { id: 'a9', firstName: 'Noureddine', lastName: 'Fassi', phone: '0669012345', secondaryPhone: '0522456789', districtId: 'd1' },
  { id: 'a10', firstName: 'Brahim', lastName: 'Kettani', phone: '0660123456', districtId: 'd2' },
];

// Addresses
const streetNames = [
  'Avenue Mohammed V', 'Rue Ibn Toumert', 'Boulevard Hassan II', 'Rue Oued Fes',
  'Avenue Fal Ould Oumeir', 'Rue Cadi Ayad', 'Boulevard Zerktouni', 'Avenue Allal Ben Abdellah',
  'Rue Jebel Tazeka', 'Boulevard Moulay Ismail', 'Avenue Atlas', 'Rue Sebou',
];

export const addresses: Address[] = [];
for (let i = 0; i < 50; i++) {
  const districtIndex = i % districts.length;
  const clientIndex = i % clients.length;
  addresses.push({
    id: `addr${i + 1}`,
    street: streetNames[i % streetNames.length],
    number: `${(i * 7 + 3) % 200 + 1}`,
    districtId: districts[districtIndex].id,
    clientId: clients[clientIndex].id,
  });
}

// Generate meter identifier (9 digits)
const generateMeterIdentifier = (index: number): string => {
  return String(index).padStart(9, '0');
};

// Meters
export const meters: Meter[] = [];
let meterIndex = 1;

// Create meters for addresses - some have water, some have electricity, some have both
for (let i = 0; i < addresses.length; i++) {
  const address = addresses[i];
  const hasWater = i % 3 !== 2; // Most addresses have water
  const hasElectricity = i % 4 !== 3; // Most addresses have electricity
  
  if (hasWater) {
    meters.push({
      id: `m${meterIndex}`,
      identifier: generateMeterIdentifier(meterIndex),
      type: 'WATER',
      addressId: address.id,
      clientId: address.clientId,
      currentIndex: Math.floor(Math.random() * 5000) + 1000,
      lastReadingDate: null,
      createdAt: new Date(2024, 0, 1 + (meterIndex % 28)).toISOString(),
    });
    meterIndex++;
  }
  
  if (hasElectricity) {
    meters.push({
      id: `m${meterIndex}`,
      identifier: generateMeterIdentifier(meterIndex),
      type: 'ELECTRICITY',
      addressId: address.id,
      clientId: address.clientId,
      currentIndex: Math.floor(Math.random() * 20000) + 5000,
      lastReadingDate: null,
      createdAt: new Date(2024, 0, 1 + (meterIndex % 28)).toISOString(),
    });
    meterIndex++;
  }
}

// Readings - Generate 300+ readings over the last 3 months
export const readings: Reading[] = [];
const now = new Date();

for (let i = 0; i < 320; i++) {
  const meterIndexForReading = i % meters.length;
  const meter = meters[meterIndexForReading];
  const agentIndex = i % agents.length;
  
  // Random date in the last 90 days
  const daysAgo = Math.floor(Math.random() * 90);
  const readingDate = new Date(now);
  readingDate.setDate(readingDate.getDate() - daysAgo);
  readingDate.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  
  // Calculate consumption based on type
  const consumption = meter.type === 'WATER' 
    ? Math.floor(Math.random() * 30) + 5 // 5-35 m³
    : Math.floor(Math.random() * 200) + 50; // 50-250 kWh
  
  const oldIndex = meter.currentIndex - consumption * (i + 1);
  const newIndex = oldIndex + consumption;
  
  readings.push({
    id: `r${i + 1}`,
    meterId: meter.id,
    agentId: agents[agentIndex].id,
    date: readingDate.toISOString(),
    oldIndex: Math.max(0, oldIndex),
    newIndex,
    consumption,
    type: meter.type,
    notes: i % 10 === 0 ? 'Compteur difficile d\'accès' : undefined,
  });
  
  // Update meter's last reading date
  if (!meter.lastReadingDate || new Date(meter.lastReadingDate) < readingDate) {
    meter.lastReadingDate = readingDate.toISOString();
    meter.currentIndex = newIndex;
  }
}

// Sort readings by date (most recent first)
readings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Mock credentials
export const mockCredentials = [
  { email: 'admin@ree.ma', password: 'Admin123!', userId: 'u1' },
  { email: 'user@ree.ma', password: 'User123!', userId: 'u2' },
];
