// ──────────────────────────────────────────────────────────────────────────
// APD Referral Analyzer — TypeScript interfaces
// All field names use snake_case to match Supabase/PostgreSQL column naming.
// ──────────────────────────────────────────────────────────────────────────

/* ── Provider (row in `providers` table) ── */
export interface Provider {
  id: string; // UUID
  user_id: string; // FK → auth.users.id
  name: string;
  license_number: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Referral status enum ── */
export type ReferralStatus =
  | "pending"
  | "in_review"
  | "eligible"
  | "ineligible"
  | "placed";

/* ── Nested JSON types for JSONB columns ── */

export interface Diagnosis {
  primary: string;
  secondary: string | null;
}

export interface BehavioralNotes {
  self_injury: string | null;
  other_behaviors: string | null;
  triggers: string | null;
  interventions: string | null;
}

export interface FunctionalNotes {
  community: string | null;
  independence: string | null;
  hygiene: string | null;
  dressing: string | null;
  self_protection: string | null;
  evacuation: string | null;
}

/* ── Referral (row in `referrals` table) ── */
export interface Referral {
  id: string; // TEXT PK — iConnect ID (e.g. "71176")
  provider_id: string; // FK → providers.id
  status: ReferralStatus;
  deadline: string | null; // ISO date
  diagnoses: Diagnosis | null; // JSONB
  behavioral_notes: BehavioralNotes | null; // JSONB
  functional_notes: FunctionalNotes | null; // JSONB
  services_needed: string[]; // TEXT[]
  placement_considerations: string[]; // TEXT[]
  raw_extracted_json: Record<string, unknown> | null; // JSONB — full Claude extraction
  created_at: string;
  updated_at: string;
}

/* ── Consumer (row in `consumers` table — 1:1 with referral) ── */

export interface Guardian {
  name: string;
  phone: string | null;
  address: string | null;
}

export interface LegalStatus {
  type: string;
  guardian: Guardian | null;
  guardianship_types: string[];
}

export interface ContactPerson {
  name: string;
  id?: string;
  title?: string;
  region?: string;
  phone?: string;
  email?: string;
}

export interface Consumer {
  id: string; // UUID
  referral_id: string; // FK → referrals.id (UNIQUE)
  first_name: string;
  last_name: string;
  dob: string;
  age: number | null;
  gender: string | null;
  medicaid_number: string | null;
  region: string | null;
  current_residence: string | null;
  address: string | null;
  phone: string | null;
  legal_status: LegalStatus | null; // JSONB
  support_coordinator: ContactPerson | null; // JSONB
  referral_coordinator: ContactPerson | null; // JSONB
  created_at: string;
}

/* ── QSI Assessment (row in `qsi_assessments` table — 1:1 with referral) ── */

export interface QSIFunctionalDetails {
  vision: number;
  hearing: number;
  eating: number;
  ambulation: number;
  transfers: number;
  toileting: number;
  hygiene: number;
  dressing: number;
  communications: number;
  self_protection: number;
  evacuation: number;
}

export interface QSIBehavioralDetails {
  self_injury: number;
  aggression: number;
  property_destruction: number;
  sexual_behavior: number;
  running_away: number;
  other_behaviors: number;
}

export interface QSIPhysicalDetails {
  injury_from_sib: number;
  injury_from_aggression: number;
  mechanical_restraint: number;
  chemical_restraint: number;
  psychotropic_meds: number;
  gastrointestinal: number;
  seizures: number;
  skin_breakdown: number;
  bowel_function: number;
  nutrition: number;
  chronic_health: number;
  injuries: number;
  falls: number;
  physician_visits: number;
  er_visits: number;
  hospital_admissions: number;
  missed_days: number;
}

export interface QSILevel {
  level: number;
  details: QSIFunctionalDetails | QSIBehavioralDetails | QSIPhysicalDetails;
}

export interface LifeChangeStress {
  score: number;
  level: string;
  signs_and_symptoms: boolean;
  recent_changes: string[];
}

export interface QSIAssessment {
  id: string; // UUID
  referral_id: string; // FK → referrals.id (UNIQUE)
  overall_support_level: string | null;
  level_rating: number | null;
  functional_level: number | null;
  functional_details: QSIFunctionalDetails | null; // JSONB
  behavioral_level: number | null;
  behavioral_details: QSIBehavioralDetails | null; // JSONB
  physical_level: number | null;
  physical_details: QSIPhysicalDetails | null; // JSONB
  life_change_stress: LifeChangeStress | null; // JSONB
  created_at: string;
}

/* ── LRC Review (row in `lrc_reviews` table — 1:1 with referral) ── */

export interface ResHabEligibility {
  behavior_analysis: boolean;
  behavior_assistant: boolean;
  life_skills_3: boolean;
  life_skills_4: boolean;
  residential_hab: boolean;
}

export interface BehaviorFocused {
  eligible: boolean;
  reason: string | null;
  next_review_date: string | null;
}

export interface LRCReview {
  id: string; // UUID
  referral_id: string; // FK → referrals.id (UNIQUE)
  review_date: string | null;
  reviewer: string | null;
  status: string | null;
  notes: string | null;
  psych_eval_note: string | null;
  reshab_level: string | null; // "Standard", "Moderate", "Extensive", "Pervasive"
  reshab_designation: string | null; // "STD", "MOD", "EXT", "PER"
  eligibility: ResHabEligibility | null; // JSONB
  behavior_focused: BehaviorFocused | null; // JSONB
  created_at: string;
}

/* ── Referral Document (row in `documents` table) ── */

export type DocumentType = "lrc_base" | "qsi" | "support_plan" | "other";
export type DocumentStatus = "pending" | "processing" | "complete" | "error";

export interface ReferralDocument {
  id: string; // UUID
  referral_id: string; // FK → referrals.id
  name: string;
  type: DocumentType;
  doc_subtype: string | null; // e.g. "Attachment E", "SPSV 1799"
  status: DocumentStatus;
  storage_path: string | null;
  upload_date: string;
  created_at: string;
}

/* ── Composite type for full referral detail view ── */
export interface ReferralDetail {
  referral: Referral;
  consumer: Consumer | null;
  qsi_assessment: QSIAssessment | null;
  lrc_review: LRCReview | null;
  documents: ReferralDocument[];
}

/* ── Type guards ── */

export function isReferralStatus(value: string): value is ReferralStatus {
  return ["pending", "in_review", "eligible", "ineligible", "placed"].includes(
    value,
  );
}

export function isDocumentType(value: string): value is DocumentType {
  return ["lrc_base", "qsi", "support_plan", "other"].includes(value);
}

export function isDocumentStatus(value: string): value is DocumentStatus {
  return ["pending", "processing", "complete", "error"].includes(value);
}
