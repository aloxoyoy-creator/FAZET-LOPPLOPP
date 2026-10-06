import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

export interface SemesterScores {
  [subject: string]: number;
}

export interface StudentRaporData {
  id: string;
  semester_1?: SemesterScores;
  semester_2?: SemesterScores;
  semester_3?: SemesterScores;
  semester_4?: SemesterScores;
  semester_5?: SemesterScores;
  isBlocked?: boolean;
  blockReason?: string;
  warnings?: number;
}

export interface CurriculumSettings {
  sem1_2: string[];
  sem3_4_5: string[];
}

export interface RaporSettings {
  curriculum?: CurriculumSettings;
  security?: {
    isTokenTimerPaused?: boolean;
    strictMode?: boolean;
    loginToken?: string;
    antiCopy?: boolean;
  };
}

export async function getStudentRapor(studentId: string = 'fathur'): Promise<StudentRaporData | null> {
  if (!firestore) return null;
  try {
    const docRef = doc(firestore, 'rapor_siswa', studentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<StudentRaporData, 'id'>) };
  } catch (error) {
    console.error('Error fetching student rapor:', error);
    throw error;
  }
}

export function subscribeStudentRapor(studentId: string = 'fathur', callback: (data: StudentRaporData | null) => void) {
  if (!firestore) {
    callback(null);
    return () => {};
  }
  const docRef = doc(firestore, 'rapor_siswa', studentId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...(snap.data() as Omit<StudentRaporData, 'id'>) });
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Subscription error for student rapor:', err);
  });
}

export async function getRaporCurriculum(): Promise<CurriculumSettings | null> {
  if (!firestore) return null;
  try {
    const docRef = doc(firestore, 'rapor_settings', 'curriculum');
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as CurriculumSettings;
  } catch (error) {
    console.error('Error fetching curriculum settings:', error);
    return null;
  }
}

export async function getAllStudents(): Promise<string[]> {
  if (!firestore) return ['fathur'];
  try {
    const colRef = collection(firestore, 'rapor_siswa');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.id);
  } catch (error) {
    console.error('Error fetching student list:', error);
    return ['fathur'];
  }
}
