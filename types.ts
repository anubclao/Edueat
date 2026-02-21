
export type Role = 'admin' | 'student' | 'visitor' | 'driver' | string;

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string; // WhatsApp number
  role: Role;
  grade?: number; // 1-11 for students
  section?: string; // A, B, Unique
  allergies?: string; // Free text for allergies
  emailVerified: boolean;
  verificationToken?: string;
  tokenExpiresAt?: number; // Timestamp (Date.now())
};

// New Dynamic Category Interface
export interface CategoryDef {
  id: string;
  name: string;
  order: number; // To determine the step sequence in OrderFlow
}

// Interface for Dynamic Roles
export interface RoleDef {
  id: string; // The key used in code (e.g., 'teacher')
  name: string; // Display name (e.g., 'Profesor')
  description?: string;
  isSystem: boolean; // If true, cannot be deleted (admin, student, visitor)
}

export interface SystemNotification {
  id: string;
  date: string; // YYYY-MM-DD (The day it is relevant for)
  message: string;
  originalMessage?: string; // To keep track of what the admin typed before AI
  type: 'info' | 'alert' | 'success';
  targetRole: 'all' | 'student' | 'staff';
}

// Previously 'Category' was a union type, now it's just a string referencing CategoryDef.id
// We keep the type alias for compatibility in some places, but conceptually it's a string ID.
export type Category = string; 

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string; // References CategoryDef.id
  calories: number;
  imageUrl?: string; // URL for the recipe image
}

// Configuration for a specific menu day
export interface DailyMenuConfig {
  date: string; // ISO string YYYY-MM-DD
  items: {
    recipeId: string;
    isMandatory: boolean; // Admin rule: must select one of this type?
  }[];
  isPublished: boolean;
}

export interface OrderItem {
  category: string; // References CategoryDef.id
  recipeId: string;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: number;
  studentSection?: string;
  studentAllergies?: string;
  date: string; // YYYY-MM-DD
  items: OrderItem[];
  status: 'confirmed' | 'pending';
  timestamp: string;
}

export interface RecurringPreference {
  studentId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  items: { category: string; recipeId: string }[];
}

// --- SURVEY TYPES ---
export type SurveyType = 'suggestion' | 'complaint' | 'claim' | 'congratulation';

// 1. Definition of the Survey Period (Created by Admin)
export interface SurveyDefinition {
  id: string;
  title: string; // e.g., "Encuesta Primer Bimestre"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean; // Manual override
  createdAt: string;
}

// 2. The actual response from a user
export interface SurveyResult {
  id: string;
  surveyDefinitionId: string; // Links to the specific period
  userId: string;
  userName: string;
  userRole: string; 
  date: string; // ISO Timestamp of submission
  qualityRating: number; // 1-5
  quantityRating: number; // 1-5
  type: SurveyType;
  comment: string;
  adminResponse?: string;
  status: 'pending' | 'resolved';
}
