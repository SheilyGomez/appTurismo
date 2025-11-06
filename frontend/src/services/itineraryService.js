// services/itineraryService.js (actualizado)
import { db } from './firebaseConfig';
import { auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

export const createActivity = async (activityData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const docRef = await addDoc(collection(db, "itinerarios"), {
    ...activityData,
    userId: user.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

export const updateActivity = async (id, activityData) => {
  await updateDoc(doc(db, "itinerarios", id), {
    ...activityData,
    updatedAt: new Date(),
  });
};

export const getUserItineraries = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(collection(db, "itinerarios"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    // Asegurar que la fecha esté en formato correcto
    date: doc.data().date || '',
    time: doc.data().time || ''
  }));
};

export const deleteActivity = async (id) => {
  await deleteDoc(doc(db, "itinerarios", id));
};