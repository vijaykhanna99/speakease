/* ─────────────────────────────────────────────
   SpeakEase – localStorage-based Auth & Data Library
   Single admin account (app owner only)
───────────────────────────────────────────── */

export type UserRole = 'patient' | 'doctor' | 'admin';
export type DoctorStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type BookingMode = 'online' | 'in-clinic';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  doctorStatus?: DoctorStatus;
  phone?: string;
  createdAt: string;
}

export interface DoctorApplication {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  submittedAt: string;
  status: DoctorStatus;
  adminNote?: string;
  reviewedAt?: string;
  // Professional
  specializations: string[];
  registrationBody: string;
  registrationNumber: string;
  experience: string;
  qualifications?: { degree: string; institute: string; year: string }[];
  languages: string[];
  ageGroups: string[];
  bio: string;
  // Personal
  gender?: string;
  city: string;
  state: string;
  pincode?: string;
  // Practice
  mode: string;
  fee: string;
  duration: string;
  clinicName?: string;
  clinicAddress?: string;
  availability?: string[];       // e.g. ['Mon','Tue','Wed']
  availabilityStart?: string;    // e.g. '09:00'
  availabilityEnd?: string;      // e.g. '18:00'
  // Document upload status
  docPhoto?: boolean;
  docDegree?: boolean;
  docRegCert?: boolean;
  docGovId?: boolean;
  docExpCert?: boolean;
  // Actual file data (base64 data URLs) — stored when doctor submits the form
  docPhotoData?: string;
  docDegreeData?: string;
  docRegCertData?: string;
  docGovIdData?: string;
  docExpCertData?: string;
}

export interface Booking {
  id: string;
  // Patient info
  patientId: string;       // 'guest' if not registered
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  // Doctor info
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  // Session info
  date: string;            // ISO date "2025-02-24"
  time: string;            // "10:00 AM"
  mode: BookingMode;
  concern: string;
  amount: number;
  status: BookingStatus;
  // Meta
  createdAt: string;
  createdByAdmin?: boolean;
  cancelledAt?: string;
  cancelledBy?: 'patient' | 'doctor' | 'admin';
  cancelReason?: string;
  notes?: string;
}

/* ─── Storage Keys ─── */
const USERS_KEY    = 'speakease_users';
const SESSION_KEY  = 'speakease_session';
const APPS_KEY     = 'speakease_applications';
const BOOKINGS_KEY = 'speakease_bookings';
const SEEDED_KEY   = 'speakease_seeded_v4';   // bump to re-seed

/* ──────────────────────────────────────────────
   SEED DATA
────────────────────────────────────────────── */
const SEED_USERS: User[] = [
  {
    id: 'usr_admin_1',
    email: 'admin@speakease.in',
    passwordHash: 'Admin@123',
    name: 'SpeakEase Admin',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_doc_1',
    email: 'dr.priya@speakease.in',
    passwordHash: 'Doctor@123',
    name: 'Dr. Priya Sharma',
    role: 'doctor',
    doctorStatus: 'approved',
    phone: '+91 98765 43210',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'usr_doc_p1',
    email: 'dr.karthik@example.com',
    passwordHash: 'Doctor@123',
    name: 'Dr. Karthik Rajan',
    role: 'doctor',
    doctorStatus: 'pending',
    phone: '+91 98001 12345',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'usr_doc_p2',
    email: 'dr.sneha@example.com',
    passwordHash: 'Doctor@123',
    name: 'Dr. Sneha Iyer',
    role: 'doctor',
    doctorStatus: 'pending',
    phone: '+91 97001 54321',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'usr_doc_r1',
    email: 'dr.ramesh@example.com',
    passwordHash: 'Doctor@123',
    name: 'Dr. Ramesh Pillai',
    role: 'doctor',
    doctorStatus: 'rejected',
    phone: '+91 96001 11111',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'usr_pat_1',
    email: 'ravi@example.com',
    passwordHash: 'Patient@123',
    name: 'Ravi Krishnamurthy',
    role: 'patient',
    phone: '+91 90001 23456',
    createdAt: '2024-08-15T00:00:00Z',
  },
  {
    id: 'usr_pat_2',
    email: 'meera@example.com',
    passwordHash: 'Patient@123',
    name: 'Meera Subramaniam',
    role: 'patient',
    phone: '+91 90002 34567',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'usr_pat_3',
    email: 'arjun@example.com',
    passwordHash: 'Patient@123',
    name: 'Arjun Menon',
    role: 'patient',
    phone: '+91 90003 45678',
    createdAt: '2024-10-10T00:00:00Z',
  },
];

const SEED_APPLICATIONS: DoctorApplication[] = [
  {
    id: 'app_1',
    userId: 'usr_doc_1',
    email: 'dr.priya@speakease.in',
    name: 'Dr. Priya Sharma',
    phone: '+91 98765 43210',
    gender: 'Female',
    submittedAt: '2024-06-01T10:00:00Z',
    status: 'approved',
    reviewedAt: '2024-06-03T14:00:00Z',
    adminNote: 'Excellent credentials. RCI registration verified successfully.',
    specializations: ['Speech Therapy', 'Audiology'],
    registrationBody: 'RCI',
    registrationNumber: 'RCI/SLP/2018/12345',
    experience: '6',
    qualifications: [
      { degree: 'M.Sc. Speech-Language Pathology', institute: 'All India Institute of Speech & Hearing, Mysore', year: '2018' },
      { degree: 'B.Sc. Audiology & Speech-Language Pathology', institute: 'Manipal Academy of Higher Education', year: '2016' },
    ],
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    bio: 'Expert Speech-Language Pathologist with 6 years specializing in post-stroke aphasia, stuttering, and voice disorders. Trained in LSVT LOUD for Parkinson\'s disease and early intervention for language delays.',
    languages: ['English', 'Hindi', 'Kannada'],
    ageGroups: ['Children (6–12)', 'Teens (13–17)', 'Adults (18–60)', 'Seniors (60+)'],
    mode: 'both',
    fee: '800',
    duration: '45',
    clinicName: 'Apollo Speech & Hearing Centre',
    clinicAddress: '154, Bannerghatta Road, JP Nagar, Bangalore - 560078',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availabilityStart: '09:00',
    availabilityEnd: '18:00',
    docPhoto: true,
    docDegree: true,
    docRegCert: true,
    docGovId: true,
  },
  {
    id: 'app_2',
    userId: 'usr_doc_p1',
    email: 'dr.karthik@example.com',
    name: 'Dr. Karthik Rajan',
    phone: '+91 98001 12345',
    gender: 'Male',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'pending',
    specializations: ['Audiology', 'Cochlear Implant Rehabilitation'],
    registrationBody: 'RCI',
    registrationNumber: 'RCI/AUD/2020/67890',
    experience: '4',
    qualifications: [
      { degree: 'M.Sc. Audiology', institute: 'JIPMER, Puducherry', year: '2020' },
      { degree: 'B.Sc. Audiology & Speech-Language Pathology', institute: 'Sri Ramachandra University, Chennai', year: '2018' },
    ],
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600006',
    bio: 'Audiologist specializing in hearing loss diagnosis, hearing aid fitting, and cochlear implant rehabilitation for pediatric and adult patients. Experienced in auditory brainstem response (ABR) testing and vestibular assessment.',
    languages: ['English', 'Tamil'],
    ageGroups: ['Infants (0–1)', 'Children (6–12)', 'Adults (18–60)', 'Seniors (60+)'],
    mode: 'in-clinic',
    fee: '1200',
    duration: '60',
    clinicName: 'Karthik Audiology & Speech Clinic',
    clinicAddress: '23, T. Nagar, Anna Salai, Chennai - 600017',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityStart: '10:00',
    availabilityEnd: '19:00',
    docPhoto: true,
    docDegree: true,
    docRegCert: true,
    docGovId: false,
  },
  {
    id: 'app_3',
    userId: 'usr_doc_p2',
    email: 'dr.sneha@example.com',
    name: 'Dr. Sneha Iyer',
    phone: '+91 97001 54321',
    gender: 'Female',
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'pending',
    specializations: ['Psychology', 'Child Psychology'],
    registrationBody: 'MCI',
    registrationNumber: 'MCI/PSY/2019/54321',
    experience: '5',
    qualifications: [
      { degree: 'M.Phil. Clinical Psychology', institute: 'NIMHANS, Bangalore', year: '2019' },
      { degree: 'M.A. Psychology', institute: 'University of Mumbai', year: '2017' },
      { degree: 'B.A. Psychology (Honours)', institute: 'St. Xavier\'s College, Mumbai', year: '2015' },
    ],
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    bio: 'Clinical psychologist with expertise in child and adolescent psychology, anxiety disorders, and depression. Uses evidence-based approaches including CBT, play therapy, and mindfulness-based interventions. Fluent in Hindi and Marathi for non-English speaking families.',
    languages: ['English', 'Hindi', 'Marathi'],
    ageGroups: ['Children (6–12)', 'Teens (13–17)', 'Adults (18–60)'],
    mode: 'both',
    fee: '1500',
    duration: '50',
    clinicName: 'MindSpace Wellness Centre',
    clinicAddress: '7th Floor, Bandra Kurla Complex, Bandra East, Mumbai - 400051',
    availability: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availabilityStart: '11:00',
    availabilityEnd: '20:00',
    docPhoto: true,
    docDegree: true,
    docRegCert: true,
    docGovId: true,
  },
  {
    id: 'app_4',
    userId: 'usr_doc_r1',
    email: 'dr.ramesh@example.com',
    name: 'Dr. Ramesh Pillai',
    phone: '+91 96001 11111',
    gender: 'Male',
    submittedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'rejected',
    reviewedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    adminNote: 'Could not verify RCI registration number. Please reapply with correct documentation.',
    specializations: ['Physiotherapy'],
    registrationBody: 'Other',
    registrationNumber: 'PHYS/2022/INVALID',
    experience: '2',
    qualifications: [
      { degree: 'B.P.T. (Bachelor of Physiotherapy)', institute: 'Osmania University, Hyderabad', year: '2022' },
    ],
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    bio: 'Physiotherapist with focus on sports injuries and rehabilitation.',
    languages: ['English', 'Telugu', 'Hindi'],
    ageGroups: ['Adults (18–60)', 'Seniors (60+)'],
    mode: 'in-clinic',
    fee: '900',
    duration: '45',
    clinicName: 'ActiveFit Physiotherapy',
    clinicAddress: 'Plot 12, Jubilee Hills, Hyderabad - 500033',
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    availabilityStart: '08:00',
    availabilityEnd: '17:00',
    docPhoto: true,
    docDegree: true,
    docRegCert: false,
    docGovId: true,
  },
];

// Helper to get date strings relative to today
const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const daysFromNow = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'BK001',
    patientId: 'usr_pat_1', patientName: 'Ravi Krishnamurthy', patientPhone: '+91 90001 23456', patientEmail: 'ravi@example.com',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysFromNow(0), time: '4:00 PM', mode: 'online', concern: 'Post-Stroke Aphasia',
    amount: 800, status: 'confirmed', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'BK002',
    patientId: 'usr_pat_2', patientName: 'Meera Subramaniam', patientPhone: '+91 90002 34567', patientEmail: 'meera@example.com',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysFromNow(0), time: '6:00 PM', mode: 'online', concern: 'Voice Disorder',
    amount: 800, status: 'confirmed', createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'BK003',
    patientId: 'guest', patientName: 'Rahul Nair', patientPhone: '+91 91001 11111',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysFromNow(1), time: '10:00 AM', mode: 'in-clinic', concern: 'Stuttering',
    amount: 800, status: 'pending', createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'BK004',
    patientId: 'usr_pat_3', patientName: 'Arjun Menon', patientPhone: '+91 90003 45678', patientEmail: 'arjun@example.com',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysFromNow(1), time: '12:00 PM', mode: 'online', concern: 'Language Delay',
    amount: 800, status: 'confirmed', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'BK005',
    patientId: 'guest', patientName: 'Suresh Patel', patientPhone: '+91 92001 22222',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysFromNow(4), time: '11:00 AM', mode: 'in-clinic', concern: 'Articulation (Stroke)',
    amount: 800, status: 'confirmed', createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'BK006',
    patientId: 'usr_pat_2', patientName: 'Meera Subramaniam', patientPhone: '+91 90002 34567', patientEmail: 'meera@example.com',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysAgo(6), time: '5:00 PM', mode: 'online', concern: 'Dysarthria',
    amount: 800, status: 'completed', createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'BK007',
    patientId: 'usr_pat_3', patientName: 'Arjun Menon', patientPhone: '+91 90003 45678', patientEmail: 'arjun@example.com',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysAgo(9), time: '4:30 PM', mode: 'online', concern: 'Language Delay',
    amount: 800, status: 'completed', createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: 'BK008',
    patientId: 'usr_pat_1', patientName: 'Ravi Krishnamurthy', patientPhone: '+91 90001 23456', patientEmail: 'ravi@example.com',
    doctorId: 'usr_doc_1', doctorName: 'Dr. Priya Sharma', doctorSpecialty: 'Speech Therapy',
    date: daysAgo(11), time: '3:00 PM', mode: 'online', concern: 'Voice Fatigue',
    amount: 800, status: 'cancelled', cancelledBy: 'patient', cancelReason: 'Personal emergency',
    cancelledAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

/* ──────────────────────────────────────────────
   STORAGE HELPERS
────────────────────────────────────────────── */
function initStorage() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  localStorage.setItem(APPS_KEY, JSON.stringify(SEED_APPLICATIONS));
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
  localStorage.setItem(SEEDED_KEY, '1');
}

export function getUsers(): User[] {
  initStorage();
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getApplications(): DoctorApplication[] {
  initStorage();
  try { return JSON.parse(localStorage.getItem(APPS_KEY) || '[]'); } catch { return []; }
}
export function saveApplications(apps: DoctorApplication[]) {
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
}

export function getBookings(): Booking[] {
  initStorage();
  try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); } catch { return []; }
}
export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

/* ──────────────────────────────────────────────
   SESSION
────────────────────────────────────────────── */
export function getCurrentSession(): User | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
export function setSession(user: User | null) {
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(SESSION_KEY);
}

/* ──────────────────────────────────────────────
   AUTH ACTIONS
────────────────────────────────────────────── */
export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, error: 'No account found with this email.' };
  if (user.passwordHash !== password) return { success: false, error: 'Incorrect password.' };
  if (user.role === 'doctor' && user.doctorStatus === 'pending') {
    return { success: false, error: 'Your application is under review. You will be notified by email once approved.' };
  }
  if (user.role === 'doctor' && user.doctorStatus === 'rejected') {
    return { success: false, error: 'Your application was not approved. Contact support@speakease.in.' };
  }
  setSession(user);
  return { success: true, user };
}

export function registerPatient(name: string, email: string, phone: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  const newUser: User = {
    id: `usr_pat_${Date.now()}`,
    email, passwordHash: password, name, role: 'patient', phone,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  setSession(newUser);
  return { success: true, user: newUser };
}

export function registerDoctor(
  name: string, email: string, phone: string, password: string,
  appData: Omit<DoctorApplication, 'id' | 'userId' | 'email' | 'name' | 'phone' | 'submittedAt' | 'status'>
): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  const userId = `usr_doc_${Date.now()}`;
  saveUsers([...users, {
    id: userId, email, passwordHash: password, name,
    role: 'doctor', doctorStatus: 'pending', phone,
    createdAt: new Date().toISOString(),
  }]);
  saveApplications([...getApplications(), {
    id: `app_${Date.now()}`, userId, email, name, phone,
    submittedAt: new Date().toISOString(), status: 'pending', ...appData,
  }]);
  return { success: true };
}

/* ──────────────────────────────────────────────
   APPLICATION ACTIONS
────────────────────────────────────────────── */
export function approveApplication(appId: string, note: string): void {
  const apps = getApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return;
  app.status = 'approved'; app.adminNote = note; app.reviewedAt = new Date().toISOString();
  saveApplications(apps);
  const users = getUsers();
  const user = users.find(u => u.id === app.userId);
  if (user) { user.doctorStatus = 'approved'; saveUsers(users); }
}

export function rejectApplication(appId: string, note: string): void {
  const apps = getApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return;
  app.status = 'rejected'; app.adminNote = note; app.reviewedAt = new Date().toISOString();
  saveApplications(apps);
  const users = getUsers();
  const user = users.find(u => u.id === app.userId);
  if (user) { user.doctorStatus = 'rejected'; saveUsers(users); }
}

/* ──────────────────────────────────────────────
   BOOKING ACTIONS
────────────────────────────────────────────── */
export function cancelBooking(bookingId: string, reason: string, cancelledBy: 'patient' | 'doctor' | 'admin'): void {
  const bookings = getBookings();
  const b = bookings.find(b => b.id === bookingId);
  if (!b) return;
  b.status = 'cancelled';
  b.cancelledBy = cancelledBy;
  b.cancelReason = reason;
  b.cancelledAt = new Date().toISOString();
  saveBookings(bookings);
}

export function updateBookingStatus(bookingId: string, status: BookingStatus): void {
  const bookings = getBookings();
  const b = bookings.find(b => b.id === bookingId);
  if (!b) return;
  b.status = status;
  saveBookings(bookings);
}

export function createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...data,
    id: `BK${String(Date.now()).slice(-6)}`,
    createdAt: new Date().toISOString(),
  };
  saveBookings([...bookings, newBooking]);
  return newBooking;
}
