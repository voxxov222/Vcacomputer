// VCA Forensic Grading & Authentication Types
// Master Data Models for VCA Computer

export type VcaAuthVerdict =
  | 'AUTHENTIC'
  | 'LIKELY AUTHENTIC'
  | 'SUSPICIOUS'
  | 'LIKELY COUNTERFEIT'
  | 'COUNTERFEIT'
  | 'INCONCLUSIVE';

export type VcaEvidenceTaxonomy =
  | 'OBSERVED'
  | 'MEASURED'
  | 'REFERENCE_MATCH'
  | 'INFERRED'
  | 'POSSIBLE'
  | 'UNKNOWN'
  | 'INCONCLUSIVE';

export type VcaNfcStatus =
  | 'VERIFIED'
  | 'CRYPTOGRAPHICALLY_VERIFIED'
  | 'INVALID'
  | 'REVOKED'
  | 'MISMATCH'
  | 'UNAVAILABLE';

export type DefectSeverity = 'negligible' | 'minor' | 'moderate' | 'major' | 'critical';

export interface VcaBoundingBox {
  x: number; // percentage 0-100 or pixel
  y: number;
  width: number;
  height: number;
}

export interface VcaDefectEvidence {
  id: string;
  category: 'centering' | 'corner' | 'edge' | 'surface' | 'print' | 'optical' | 'auth';
  type: string; // e.g. 'whitening', 'scratch', 'dent', 'crease', 'misprint', 'chipping'
  location: string; // e.g. 'Top-Left Corner', 'Right Edge 60%', 'Holo Window Center'
  bbox: VcaBoundingBox;
  severity: DefectSeverity;
  scoreDeduction: number;
  confidence: number;
  taxonomy: VcaEvidenceTaxonomy;
  description: string;
  cropImageUrl?: string;
  referenceComparisonUrl?: string;
  observedDetails?: string;
  humanStatus: 'pending' | 'accepted' | 'rejected' | 'modified';
  humanNotes?: string;
  detectedByModel: string;
  timestamp: string;
}

export interface VcaCenteringAnalysis {
  leftBorderPx: number;
  rightBorderPx: number;
  topBorderPx: number;
  bottomBorderPx: number;
  leftRatio: number; // e.g. 52
  rightRatio: number; // e.g. 48
  topRatio: number; // e.g. 51
  bottomRatio: number; // e.g. 49
  lrRatioLabel: string; // "52/48"
  tbRatioLabel: string; // "51/49"
  lrDeltaPct: number;
  tbDeltaPct: number;
  meetsGemMint10: boolean; // <= 55/45 front, 75/25 back
  meetsMint9: boolean; // <= 60/40 front, 90/10 back
  subgrade: number; // 1.0 - 10.0
  confidence: number;
  taxonomy: VcaEvidenceTaxonomy;
}

export interface VcaCornerInspection {
  corner: 'TL' | 'TR' | 'BL' | 'BR';
  name: string;
  score: number; // e.g. 9.5
  whiteningPct: number;
  softnessRadiusPx: number;
  damageTypes: string[]; // e.g. ['fiber_exposure', 'micro_rounding']
  confidence: number;
  defects: VcaDefectEvidence[];
}

export interface VcaEdgeInspection {
  edge: 'Top' | 'Bottom' | 'Left' | 'Right';
  name: string;
  score: number; // e.g. 9.5
  whiteningSegmentsPct: number;
  chippingCount: number;
  roughCutDetected: boolean;
  roughCutSeverity: DefectSeverity;
  confidence: number;
  heatmapCoordinates: { offsetPct: number; intensity: number }[];
  defects: VcaDefectEvidence[];
}

export interface VcaSurfaceAnalysis {
  subgrade: number;
  scratchCount: number;
  indentationCount: number;
  rollerMarksDetected: boolean;
  creaseDetected: boolean;
  holographicPatternIntegrity: number; // 0-100%
  foilScratchesDetected: boolean;
  uvFluorescenceSignature: 'standard' | 'anomalous' | 'untested';
  defects: VcaDefectEvidence[];
}

export interface VcaPrintAnalysis {
  subgrade: number;
  cmykRosetteMatchScore: number; // 0-100%
  inkRegistrationPassed: boolean;
  colorHistogramDelta: number;
  fontKerningPassed: boolean;
  blackCoreLayerPassed: boolean;
  defects: VcaDefectEvidence[];
}

export interface VcaAuthEvidenceItem {
  name: string;
  category: string;
  testResult: 'PASS' | 'REVIEW' | 'FAIL';
  confidence: number;
  taxonomy: VcaEvidenceTaxonomy;
  notes: string;
  userFeatureScore?: number;
  referenceFeatureScore?: number;
}

export interface VcaAuthenticationReport {
  id: string;
  cardId: string;
  verdict: VcaAuthVerdict;
  overallConfidence: number; // 0-100
  evidenceMatrix: VcaAuthEvidenceItem[];
  referenceCardId?: string;
  referenceCardName?: string;
  referenceImageUrl?: string;
  suspiciousRegions: VcaDefectEvidence[];
  differenceMapScore: number; // 0 (identical) to 100
  hashDistance: number;
  humanReviewRequired: boolean;
  humanReviewedBy?: string;
  humanReviewTimestamp?: string;
  humanOverrideNotes?: string;
  createdAt: string;
}

export interface VcaSubgrades {
  centering: number;
  corners: number;
  edges: number;
  surface: number;
  print: number;
}

export interface VcaCornerScores {
  tl: number;
  tr: number;
  bl: number;
  br: number;
}

export interface VcaEdgeScores {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface VcaCertificationRecord {
  serialNumber: string; // e.g. "VCA-2026-00000001"
  cardId: string;
  submissionId: string;
  cardName: string;
  setName: string;
  cardNumber: string;
  year: number;
  variant: string;
  overallGrade: number; // e.g. 9.5
  gradeLabel: string; // e.g. "GEM MINT 9.5"
  subgrades: VcaSubgrades;
  cornerScores: VcaCornerScores;
  edgeScores: VcaEdgeScores;
  authVerdict: VcaAuthVerdict;
  authConfidence: number;
  defects: VcaDefectEvidence[];
  frontImageUrl: string;
  backImageUrl?: string;
  nfcUid?: string;
  nfcStatus: VcaNfcStatus;
  slabId: string;
  tamperProofHash: string;
  qrVerificationUrl: string;
  humanGraderId: string;
  humanGraderApproved: boolean;
  humanGraderNotes?: string;
  lockedAt: string;
  issuedAt: string;
}

export interface VcaLedgerEntry {
  id: string;
  serialNumber: string;
  eventType:
    | 'SUBMISSION_INTAKE'
    | 'CARD_IDENTIFIED'
    | 'OPTICAL_SCAN_COMPLETED'
    | 'AI_INSPECTION_COMPLETED'
    | 'HUMAN_REVIEW_ACCEPTED'
    | 'HUMAN_SUBGRADE_OVERRIDE'
    | 'DEFECT_STATUS_MODIFIED'
    | 'CERTIFICATE_GENERATED'
    | 'NFC_TAG_PROGRAMMED'
    | 'SLAB_ASSEMBLED'
    | 'PUBLIC_VERIFICATION_CHECK';
  actor: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  blockHash: string;
  previousHash: string;
  timestamp: string;
}

export interface VcaGradingPolicyConfig {
  gradingScale: '10_POINT_HALF_STEPS' | '100_POINT_DECIMAL';
  centeringWeight: number; // default 0.20
  cornersWeight: number; // default 0.25
  edgesWeight: number; // default 0.25
  surfaceWeight: number; // default 0.20
  printWeight: number; // default 0.10
  weakestSubgradeFloorRule: boolean; // if any subgrade <= 9.0, max overall is +0.5 above it
  gemMint10RequiresCentering: number; // e.g. 9.5
  serialFormatPrefix: string; // e.g. "VCA"
  serialYear: number; // 2026
  nfcChipType: 'NXP_NTAG424_DNA' | 'NXP_NTAG215' | 'EMV_CUSTOM';
  autoAuditLogging: boolean;
}

export type VcaToolCategory =
  | 'IMAGE_FORENSICS'
  | 'CENTERING_GEOMETRY'
  | 'PHYSICAL_CONDITION'
  | 'PRINT_AUTHENTICITY'
  | 'GRADING_DECISION'
  | 'GEOMETRY'
  | 'CONDITION'
  | 'OPTICAL'
  | 'AUTHENTICATION'
  | 'CERTIFICATION';

export interface VcaForensicAgentTool {
  id: string;
  name: string;
  category: VcaToolCategory;
  categoryIndex: 1 | 2 | 3 | 4 | 5;
  toolNumber: number; // 1 to 25
  description: string;
  version: string;
  inputs: string[];
  outputs: string[];
  permissions: 'OPERATOR' | 'GRADER' | 'SENIOR_GRADER' | 'ADMIN';
  enabled: boolean;
  isAiCallable: boolean;
  hardwareRequired?: boolean;
}

export type ForensicViewFilter =
  | 'original'
  | 'enhanced'
  | 'negative'
  | 'grayscale'
  | 'high_contrast'
  | 'edge_sobel'
  | 'edge_laplacian'
  | 'threshold'
  | 'difference_map'
  | 'heatmap'
  | 'rgb_red'
  | 'rgb_green'
  | 'rgb_blue'
  | 'magnified'
  | 'surface_analysis'
  | 'centering_grid'
  | 'corner_analysis'
  | 'edge_analysis'
  | 'auth_overlay'
  | 'ref_comparison';
