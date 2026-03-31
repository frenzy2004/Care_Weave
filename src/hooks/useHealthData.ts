import { useState, useEffect, useCallback } from 'react';
import { Patient, SymptomEntry, Medication, Provider, Visit } from '@/types/health';
import { samplePatient, sampleSymptoms, sampleMedications, sampleProviders, sampleVisits } from '@/data/sampleData';

function useLocalStorage<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export function useHealthData() {
  const [patient, setPatient] = useLocalStorage<Patient>('cw_patient', samplePatient);
  const [symptoms, setSymptoms] = useLocalStorage<SymptomEntry[]>('cw_symptoms', sampleSymptoms);
  const [medications, setMedications] = useLocalStorage<Medication[]>('cw_medications', sampleMedications);
  const [providers, setProviders] = useLocalStorage<Provider[]>('cw_providers', sampleProviders);
  const [visits, setVisits] = useLocalStorage<Visit[]>('cw_visits', sampleVisits);
  const [doctorMode, setDoctorMode] = useLocalStorage<boolean>('cw_doctorMode', false);

  const addSymptom = useCallback((entry: Omit<SymptomEntry, 'id'>) => {
    setSymptoms(prev => [...prev, { ...entry, id: `s${Date.now()}` }]);
  }, [setSymptoms]);

  const addMedication = useCallback((med: Omit<Medication, 'id'>) => {
    setMedications(prev => [...prev, { ...med, id: `m${Date.now()}` }]);
  }, [setMedications]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [setMedications]);

  const addProvider = useCallback((provider: Omit<Provider, 'id'>) => {
    setProviders(prev => [...prev, { ...provider, id: `p${Date.now()}` }]);
  }, [setProviders]);

  const removeProvider = useCallback((id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  }, [setProviders]);

  const addVisit = useCallback((visit: Omit<Visit, 'id'>) => {
    setVisits(prev => [...prev, { ...visit, id: `v${Date.now()}` }]);
  }, [setVisits]);

  const resetToSampleData = useCallback(() => {
    setPatient(samplePatient);
    setSymptoms(sampleSymptoms);
    setMedications(sampleMedications);
    setProviders(sampleProviders);
    setVisits(sampleVisits);
  }, [setPatient, setSymptoms, setMedications, setProviders, setVisits]);

  return {
    patient, setPatient,
    symptoms, addSymptom,
    medications, addMedication, updateMedication,
    providers, addProvider, removeProvider,
    visits, addVisit,
    doctorMode, setDoctorMode,
    resetToSampleData,
  };
}
