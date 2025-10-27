import { useState, useEffect } from 'react';
import type { UserProfile, BMIInfo } from '../types/menu';
import {
  calculateBMI,
  getBMIInfo,
  getIdealWeightRange,
  calculateDailyCalories,
  saveProfileToStorage,
  loadProfileFromStorage
} from '../utils/bmiCalculator';

export function useBMI(userId: string) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [bmiInfo, setBMIInfo] = useState<BMIInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const savedProfile = loadProfileFromStorage(userId);
    if (savedProfile) {
      setProfile(savedProfile);
      const bmi = calculateBMI(savedProfile.height, savedProfile.weight);
      if (bmi !== null) {
        setBMIInfo(getBMIInfo(bmi));
      }
    }
    setIsLoading(false);
  }, [userId]);

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfileToStorage(userId, newProfile);

    // Recalculate BMI
    const bmi = calculateBMI(newProfile.height, newProfile.weight);
    if (bmi !== null) {
      setBMIInfo(getBMIInfo(bmi));
    } else {
      setBMIInfo(null);
    }
  };

  const idealWeightRange = profile.height ? getIdealWeightRange(profile.height) : null;
  const dailyCalories = calculateDailyCalories(profile);

  return {
    profile,
    bmiInfo,
    idealWeightRange,
    dailyCalories,
    isLoading,
    updateProfile
  };
}

export function useBMIInsight() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [bmiInfo, setBMIInfo] = useState<BMIInfo | null>(null);

  const updateBMIProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);

    const bmi = calculateBMI(newProfile.height, newProfile.weight);
    if (bmi !== null) {
      setBMIInfo(getBMIInfo(bmi));
    } else {
      setBMIInfo(null);
    }
  };

  return {
    profile,
    bmiInfo,
    updateBMIProfile
  };
}