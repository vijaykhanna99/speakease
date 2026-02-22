export type Specialization =
  | 'Speech Therapy'
  | 'Psychology'
  | 'Physiotherapy'
  | 'Occupational Therapy'
  | 'Behavioral Therapy'
  | 'Audiology'
  | 'Special Education'
  | 'Child Development';

export type ConsultationMode = 'online' | 'in-clinic' | 'both';
export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi' | 'Bengali' | 'Gujarati';

export interface Therapist {
  id: string;
  userId?: string;   // maps to auth user ID when doctor is on the platform
  name: string;
  title: string;
  specializations: Specialization[];
  experience: number;
  rating: number;
  reviewCount: number;
  fee: number;
  city: string;
  state: string;
  languages: Language[];
  mode: ConsultationMode;
  bio: string;
  qualifications: string[];
  registrationNo: string;
  nextAvailable: string;
  verified: boolean;
  featured: boolean;
  avatar: string;
  conditions: string[];
  ageGroups: string[];
  sessionDuration: number;
}

export interface Review {
  id: string;
  therapistId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  condition?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  therapistId: string;
  patientName: string;
  patientAge: number;
  concern: string;
  date: string;
  time: string;
  mode: ConsultationMode;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  createdAt: string;
}
