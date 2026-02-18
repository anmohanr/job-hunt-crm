export const PIPELINE_STAGES = [
  "Interested",
  "Applied",
  "Recruiter Screen",
  "Tech Screen",
  "Onsite",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PRIORITIES = ["Low", "Med", "High"] as const;

export type Priority = (typeof PRIORITIES)[number];
