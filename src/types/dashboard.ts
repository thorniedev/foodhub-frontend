export type Gender = "ប្រុស" | "ស្រី" | "មិនបញ្ជាក់";

export interface UserProfile {
  fullName: string;
  gender: Gender;
  bio: string;
  email: string;
  phone: string;
  birthDate: string; // ISO yyyy-mm-dd
  age: number;
  memberSinceDays: number;
  goalsInProgress: number;
  avatarInitials: string;
}

export interface TagOption {
  id: string;
  label: string;
  /** visual variant used to match the screenshot (green = active/positive, orange = warning/allergy) */
  variant?: "default" | "warning";
}

export interface DashboardState {
  profile: UserProfile;
  healthGoals: string[]; // selected ids from healthGoalOptions
  dietaryPreferences: string[]; // selected ids from dietaryOptions
  allergies: string[]; // selected ids from allergyOptions
  cuisines: string[]; // selected ids from cuisineOptions
  likedFoods: string[];
  dislikedFoods: string[];
}