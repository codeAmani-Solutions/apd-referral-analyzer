-- ============================================================================
-- APD Referral Analyzer — Seed Data
-- Run in Supabase SQL Editor to populate dev/test data.
-- Matches the prototype SAMPLE_REFERRAL_DATA (Justin Chacon #71176)
-- plus a second referral for dashboard/list testing.
-- ============================================================================

-- 1) Provider (linked to a known auth user — replace user_id after first login)
INSERT INTO providers (id, user_id, name, license_number, region, created_at, updated_at)
VALUES (
  '3c845eb6-f073-48b7-ae37-cf5c13283e85',
  'a0000000-0000-0000-0000-000000000001',   -- seed@apd-dev.local; real users get linked via fetchOrCreateProvider
  'MotionStack Group Home',
  'GH-2024-0042',
  'Central',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2) Referral #1 — Justin Chacon (primary seed)
INSERT INTO referrals (
  id, provider_id, status, deadline,
  diagnoses, behavioral_notes, functional_notes,
  services_needed, placement_considerations,
  raw_extracted_json, created_at, updated_at
) VALUES (
  '71176',
  '3c845eb6-f073-48b7-ae37-cf5c13283e85',
  'in_review',
  '2025-09-15',
  '{"primary": "Intellectual Disability - Moderate (F71)", "secondary": "Autism Spectrum Disorder (F84.0)"}',
  '{"self_injury": "Head banging when overstimulated — frequency: 2-3x/week", "other_behaviors": "Verbal outbursts, eloping from supervised area", "triggers": "Schedule changes, loud environments, denied preferred activities", "interventions": "Redirection, sensory breaks, visual schedule, PRN Hydroxyzine"}',
  '{"community": "Requires 1:1 in community settings", "independence": "Semi-independent with ADLs, needs verbal prompts", "hygiene": "Independent with verbal cues", "dressing": "Independent", "self_protection": "Limited awareness of danger — requires line-of-sight supervision", "evacuation": "Can evacuate with verbal direction"}',
  ARRAY['Residential Habilitation', 'Behavior Analysis', 'Life Skills Development Level 3', 'Companion Services', 'Transportation'],
  ARRAY['Single-story preferred (elopement risk)', 'Male roommate compatibility', 'Proximity to day program within 15 miles', 'Fenced outdoor area preferred', 'Low-stimulus environment'],
  NULL,
  now(),
  now()
);

-- 3) Consumer for referral #71176
INSERT INTO consumers (
  id, referral_id, first_name, last_name, dob, age, gender,
  medicaid_number, region, current_residence, address, phone,
  legal_status, support_coordinator, referral_coordinator, created_at
) VALUES (
  'c1000000-0000-4000-8000-000000000001',
  '71176',
  'Justin',
  'Chacon',
  '1998-03-14',
  27,
  'Male',
  'MCD-9928471',
  'Central',
  'Family Home',
  '1422 Sunridge Blvd, Orlando, FL 32801',
  '(407) 555-0193',
  '{"type": "Plenary Guardian", "guardian": {"name": "Maria Chacon", "phone": "(407) 555-0194", "address": "1422 Sunridge Blvd, Orlando, FL 32801"}, "guardianship_types": ["Person", "Property"]}',
  '{"name": "Diana Morales", "id": "SC-20198", "title": "Support Coordinator", "region": "Central", "phone": "(407) 555-0210", "email": "d.morales@apdcares.org"}',
  '{"name": "Robert Singh", "id": "RC-40122", "title": "Referral Coordinator", "region": "Central", "phone": "(407) 555-0225", "email": "r.singh@apdcares.org"}',
  now()
);

-- 4) QSI Assessment for referral #71176
INSERT INTO qsi_assessments (
  id, referral_id, overall_support_level, level_rating,
  functional_level, functional_details,
  behavioral_level, behavioral_details,
  physical_level, physical_details,
  life_change_stress, created_at
) VALUES (
  'q1000000-0000-4000-8000-000000000001',
  '71176',
  'Extensive',
  4,
  3,
  '{"vision": 1, "hearing": 1, "eating": 2, "ambulation": 1, "transfers": 1, "toileting": 2, "hygiene": 2, "dressing": 1, "communications": 3, "self_protection": 3, "evacuation": 2}',
  4,
  '{"self_injury": 3, "aggression": 2, "property_destruction": 2, "sexual_behavior": 1, "running_away": 3, "other_behaviors": 2}',
  2,
  '{"injury_from_sib": 2, "injury_from_aggression": 1, "mechanical_restraint": 0, "chemical_restraint": 1, "psychotropic_meds": 2, "gastrointestinal": 1, "seizures": 0, "skin_breakdown": 0, "bowel_function": 1, "nutrition": 1, "chronic_health": 1, "injuries": 1, "falls": 0, "physician_visits": 2, "er_visits": 1, "hospital_admissions": 0, "missed_days": 1}',
  '{"score": 14, "level": "Moderate", "signs_and_symptoms": true, "recent_changes": ["Change in living situation pending", "New medication started", "Day program transition"]}',
  now()
);

-- 5) LRC Review for referral #71176
INSERT INTO lrc_reviews (
  id, referral_id, review_date, reviewer, status, notes,
  psych_eval_note, reshab_level, reshab_designation,
  eligibility, behavior_focused, created_at
) VALUES (
  'l1000000-0000-4000-8000-000000000001',
  '71176',
  '2025-06-20',
  'Dr. Patricia Hernandez, PhD, BCBA',
  'Approved',
  'Consumer meets criteria for residential placement. Behavioral support plan in place. Recommend Extensive level ResHab with behavior analysis overlay.',
  'Psychological evaluation completed 2025-04-10 by Dr. Alan Whitfield. FSIQ: 48. Adaptive behavior composite: 52. Confirms moderate intellectual disability with co-occurring ASD.',
  'Extensive',
  'EXT',
  '{"behavior_analysis": true, "behavior_assistant": true, "life_skills_3": true, "life_skills_4": false, "residential_hab": true}',
  '{"eligible": true, "reason": "Meets criteria per APD Behavioral Focus criteria — frequency and severity of SIB and elopement warrant specialized behavioral residential setting.", "next_review_date": "2026-06-20"}',
  now()
);

-- 6) Documents for referral #71176
INSERT INTO documents (id, referral_id, name, type, doc_subtype, status, storage_path, upload_date, created_at) VALUES
  ('d1000000-0000-4000-8000-000000000001', '71176', 'LRC BASE Review Form', 'lrc_base', NULL, 'complete', 'referral-documents/71176/lrc-base.pdf', now(), now()),
  ('d1000000-0000-4000-8000-000000000002', '71176', 'QSI Assessment Report', 'qsi', NULL, 'complete', 'referral-documents/71176/qsi-assessment.pdf', now(), now()),
  ('d1000000-0000-4000-8000-000000000003', '71176', 'Support Plan (SP/SV 1799)', 'support_plan', 'SPSV 1799', 'complete', 'referral-documents/71176/support-plan.pdf', now(), now()),
  ('d1000000-0000-4000-8000-000000000004', '71176', 'Psychological Evaluation', 'other', 'Psych Eval', 'complete', 'referral-documents/71176/psych-eval.pdf', now(), now()),
  ('d1000000-0000-4000-8000-000000000005', '71176', 'Behavior Analysis Plan', 'other', 'BAP', 'pending', NULL, now(), now());

-- ============================================================================
-- Referral #2 — Second referral for dashboard list testing
-- ============================================================================

INSERT INTO referrals (
  id, provider_id, status, deadline,
  diagnoses, behavioral_notes, functional_notes,
  services_needed, placement_considerations,
  raw_extracted_json, created_at, updated_at
) VALUES (
  '83201',
  '3c845eb6-f073-48b7-ae37-cf5c13283e85',
  'pending',
  '2025-11-01',
  '{"primary": "Down Syndrome (Q90.9)", "secondary": "Mild Intellectual Disability (F70)"}',
  '{"self_injury": null, "other_behaviors": "Occasional verbal perseveration", "triggers": "Transitions between activities", "interventions": "Visual timer, transition warnings, positive reinforcement"}',
  '{"community": "Can participate in community with 1:2 supervision", "independence": "Mostly independent with ADLs", "hygiene": "Independent", "dressing": "Independent", "self_protection": "Adequate awareness with verbal reminders", "evacuation": "Independent evacuation"}',
  ARRAY['Residential Habilitation', 'Life Skills Development Level 3', 'Companion Services'],
  ARRAY['Female roommate preferred', 'Ground-floor bedroom', 'Within 10 miles of Suncoast Day Program'],
  NULL,
  now() - interval '3 days',
  now() - interval '3 days'
);

INSERT INTO consumers (
  id, referral_id, first_name, last_name, dob, age, gender,
  medicaid_number, region, current_residence, address, phone,
  legal_status, support_coordinator, referral_coordinator, created_at
) VALUES (
  'c2000000-0000-4000-8000-000000000002',
  '83201',
  'Amber',
  'Delgado',
  '2001-07-22',
  24,
  'Female',
  'MCD-5513820',
  'Suncoast',
  'Licensed ALF',
  '805 Palm Bay Ct, Tampa, FL 33602',
  '(813) 555-0177',
  '{"type": "Limited Guardian", "guardian": {"name": "Carlos Delgado", "phone": "(813) 555-0178", "address": "805 Palm Bay Ct, Tampa, FL 33602"}, "guardianship_types": ["Person"]}',
  '{"name": "Keisha Thompson", "id": "SC-30455", "title": "Support Coordinator", "region": "Suncoast", "phone": "(813) 555-0290", "email": "k.thompson@apdcares.org"}',
  '{"name": "Robert Singh", "id": "RC-40122", "title": "Referral Coordinator", "region": "Central", "phone": "(407) 555-0225", "email": "r.singh@apdcares.org"}',
  now() - interval '3 days'
);

INSERT INTO qsi_assessments (
  id, referral_id, overall_support_level, level_rating,
  functional_level, functional_details,
  behavioral_level, behavioral_details,
  physical_level, physical_details,
  life_change_stress, created_at
) VALUES (
  'q2000000-0000-4000-8000-000000000002',
  '83201',
  'Standard',
  2,
  2,
  '{"vision": 1, "hearing": 1, "eating": 1, "ambulation": 1, "transfers": 1, "toileting": 1, "hygiene": 1, "dressing": 1, "communications": 2, "self_protection": 2, "evacuation": 1}',
  1,
  '{"self_injury": 0, "aggression": 0, "property_destruction": 0, "sexual_behavior": 0, "running_away": 0, "other_behaviors": 1}',
  1,
  '{"injury_from_sib": 0, "injury_from_aggression": 0, "mechanical_restraint": 0, "chemical_restraint": 0, "psychotropic_meds": 0, "gastrointestinal": 0, "seizures": 0, "skin_breakdown": 0, "bowel_function": 0, "nutrition": 1, "chronic_health": 1, "injuries": 0, "falls": 0, "physician_visits": 1, "er_visits": 0, "hospital_admissions": 0, "missed_days": 0}',
  '{"score": 4, "level": "Low", "signs_and_symptoms": false, "recent_changes": ["ALF placement review"]}',
  now() - interval '3 days'
);

INSERT INTO lrc_reviews (
  id, referral_id, review_date, reviewer, status, notes,
  psych_eval_note, reshab_level, reshab_designation,
  eligibility, behavior_focused, created_at
) VALUES (
  'l2000000-0000-4000-8000-000000000002',
  '83201',
  '2025-08-05',
  'Dr. Karen Liu, PsyD',
  'Pending',
  'Awaiting updated psychological evaluation. Current ALF placement ending — consumer needs residential group home by November 2025.',
  'Last psychological evaluation 2023-02-15. Update requested.',
  'Standard',
  'STD',
  '{"behavior_analysis": false, "behavior_assistant": false, "life_skills_3": true, "life_skills_4": false, "residential_hab": true}',
  '{"eligible": false, "reason": "Pending updated psych eval — unable to finalize determination.", "next_review_date": null}',
  now() - interval '3 days'
);

INSERT INTO documents (id, referral_id, name, type, doc_subtype, status, storage_path, upload_date, created_at) VALUES
  ('d2000000-0000-4000-8000-000000000001', '83201', 'LRC BASE Review Form', 'lrc_base', NULL, 'complete', 'referral-documents/83201/lrc-base.pdf', now() - interval '3 days', now() - interval '3 days'),
  ('d2000000-0000-4000-8000-000000000002', '83201', 'QSI Assessment Report', 'qsi', NULL, 'complete', 'referral-documents/83201/qsi-assessment.pdf', now() - interval '3 days', now() - interval '3 days'),
  ('d2000000-0000-4000-8000-000000000003', '83201', 'Support Plan', 'support_plan', NULL, 'processing', NULL, now() - interval '3 days', now() - interval '3 days');
