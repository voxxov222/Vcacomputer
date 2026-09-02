// VCA Dynamic Forensic Tool Definitions
// The 25-Tool Forensic Inspection Matrix (5 Categories x 5 Advanced Tools)
// Master reference for VCA OS Forensic Laboratory

import { VcaForensicAgentTool, VcaToolCategory } from '../types/vcaGrading';

export interface VcaToolCategoryMetadata {
  id: VcaToolCategory;
  categoryIndex: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  color: string;
}

export const VCA_TOOL_CATEGORIES: VcaToolCategoryMetadata[] = [
  {
    id: 'IMAGE_FORENSICS',
    categoryIndex: 1,
    title: 'Category 1: Image Forensics & Manipulation',
    subtitle: 'Multi-spectrum enhancement, photographic negative, superimpose diff, X-ray density, and pixel artifact forensics.',
    badge: 'OPTICAL / CV',
    iconName: 'Sparkles',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'CENTERING_GEOMETRY',
    categoryIndex: 2,
    title: 'Category 2: Centering & Geometric Analysis',
    subtitle: 'Sub-pixel border calipers, front/back ratios (50/50 - 75/25), perspective homography, and physical dimensions.',
    badge: 'CALIPER / GEOM',
    iconName: 'Target',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'PHYSICAL_CONDITION',
    categoryIndex: 3,
    title: 'Category 3: Corners, Edges & Structural Condition',
    subtitle: 'Four-corner micro-whitening, 360° edge chipping heatmap, recutting profile, micro-scratches, and surface luster.',
    badge: 'PHYSICAL WEAR',
    iconName: 'Layers',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'PRINT_AUTHENTICITY',
    categoryIndex: 4,
    title: 'Category 4: Print, Authenticity & Counterfeit Forensics',
    subtitle: 'CMYK offset rosette screen angles, typography kerning, ink density distribution, holographic foil diffraction, and anomaly flags.',
    badge: 'FORENSIC AUTH',
    iconName: 'ShieldCheck',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'GRADING_DECISION',
    categoryIndex: 5,
    title: 'Category 5: Grading, Damage Scoring & VCA Decision Engine',
    subtitle: 'Defect pinboard, multi-factor subgrade engine, canonical reference comparator, final VCA audit report, and master dashboard.',
    badge: 'DECISION / LEDGER',
    iconName: 'Award',
    color: 'from-rose-500 to-pink-600'
  }
];

export const VCA_FORENSIC_TOOLS: VcaForensicAgentTool[] = [
  // ==========================================
  // CATEGORY 1: ADVANCED IMAGE FORENSICS & MANIPULATION
  // ==========================================
  {
    id: 'multi_spectrum',
    toolNumber: 1,
    categoryIndex: 1,
    name: 'Multi-Spectrum Image Enhancement',
    category: 'IMAGE_FORENSICS',
    description: 'Manipulates scan through 9 non-destructive inspection modes: Original, High Contrast, Exposure, Shadows/Highlights, Sharpness, Edge Enhancement, Detail Enhancement, Grayscale, and Inverted.',
    version: '3.4.0',
    inputs: ['canvas', 'exposure', 'contrast', 'sharpness', 'shadows', 'highlights'],
    outputs: ['enhancedCanvas', 'histogramRGB', 'luminanceProfile', 'layerState'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'negative_inversion',
    toolNumber: 2,
    categoryIndex: 1,
    name: 'Negative / Inversion Analysis',
    category: 'IMAGE_FORENSICS',
    description: 'Photographic negative inspection mode exposing retouched borders, recolored edge whitening, surface micro-scratches, and ink density differentials side-by-side with positive.',
    version: '2.8.0',
    inputs: ['canvas', 'invertChannels', 'compareMode'],
    outputs: ['invertedCanvas', 'retouchProbability', 'abnormalInkDensityRegions'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'superimpose_overlay',
    toolNumber: 3,
    categoryIndex: 1,
    name: 'Superimpose / Overlay Comparison',
    category: 'IMAGE_FORENSICS',
    description: 'Superimposes specimen scan over canonical authentic master scan with opacity fader, difference blending, sub-pixel registration, and false-color delta highlighting.',
    version: '3.1.0',
    inputs: ['specimenCanvas', 'referenceCanvas', 'blendMode', 'opacity'],
    outputs: ['blendedCanvas', 'deltaPixelsCount', 'perceptualHashDistance', 'misalignmentVector'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'xray_structural',
    toolNumber: 4,
    categoryIndex: 1,
    name: 'X-Ray / Structural Visualization',
    category: 'IMAGE_FORENSICS',
    description: 'Simulated computational X-ray density visualization based on optical transmission, cardstock core layer uniformity, thickness variations, and concealed internal re-creases.',
    version: '2.0.1',
    inputs: ['canvas', 'penetrationDepth', 'attenuationModel'],
    outputs: ['xrayDensityCanvas', 'cardstockCoreConsistency', 'subsurfaceAnomalies'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'pixel_forensics',
    toolNumber: 5,
    categoryIndex: 1,
    name: 'Pixel / Artifact Forensics',
    category: 'IMAGE_FORENSICS',
    description: 'Forensic pixel-level analysis detecting digital tampering, JPEG compression artifacts, cloning brush patterns, repeated pixels, resampling distortion, and artificial sharpening.',
    version: '2.5.0',
    inputs: ['rawImageBuffer', 'noiseThreshold'],
    outputs: ['artifactMap', 'cloningDetected', 'compressionNoiseIndex', 'flaggedPixelRegions'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },

  // ==========================================
  // CATEGORY 2: CENTERING & GEOMETRIC ANALYSIS
  // ==========================================
  {
    id: 'border_measurement',
    toolNumber: 6,
    categoryIndex: 2,
    name: 'Border Detection & Measurement',
    category: 'CENTERING_GEOMETRY',
    description: 'Automated sub-pixel edge detection identifying physical card outer perimeter and interior printed artwork border. Measures Left, Right, Top, and Bottom margins in mm and pixels.',
    version: '3.5.0',
    inputs: ['canvas', 'dpiCalibration'],
    outputs: ['leftBorderMm', 'rightBorderMm', 'topBorderMm', 'bottomBorderMm', 'borderConfidence'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'front_centering',
    toolNumber: 7,
    categoryIndex: 2,
    name: 'Front Centering Analyzer',
    category: 'CENTERING_GEOMETRY',
    description: 'Calculates front horizontal (L/R) and vertical (T/B) centering ratios against Gem Mint 10 (55/45) and Mint 9 (60/40) standards. Overlays precision calipers directly on scan.',
    version: '3.6.0',
    inputs: ['canvas', 'borderMeasurements'],
    outputs: ['lrRatio', 'tbRatio', 'meetsGemMint10', 'meetsMint9', 'centeringSubgrade', 'caliperOverlay'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'back_centering',
    toolNumber: 8,
    categoryIndex: 2,
    name: 'Back Centering Analyzer',
    category: 'CENTERING_GEOMETRY',
    description: 'Measures card reverse centering against the standard 75/25 tolerance for Gem Mint and 90/10 for Mint. Generates independent back subgrade score and boundary overlay.',
    version: '3.2.0',
    inputs: ['backCanvas', 'borderMeasurements'],
    outputs: ['backLrRatio', 'backTbRatio', 'backSubgrade', 'meetsBackStandard'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'perspective_correction',
    toolNumber: 9,
    categoryIndex: 2,
    name: 'Perspective & Keystone Correction',
    category: 'CENTERING_GEOMETRY',
    description: 'Detects camera skew, lens barrel distortion, and keystone angle. Computes 3x3 homography transformation matrix to rectify specimen straight-on without losing source pixels.',
    version: '2.9.0',
    inputs: ['canvas', 'cornerCoordinates'],
    outputs: ['rectifiedCanvas', 'homographyMatrix', 'skewAngleDeg', 'originalUntouchedPreserved'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'geometry_dimensions',
    toolNumber: 10,
    categoryIndex: 2,
    name: 'Geometry / Dimension Verification',
    category: 'CENTERING_GEOMETRY',
    description: 'Verifies physical card geometry: Standard 63.0mm x 88.0mm dimensions (aspect ratio 1.397), 3.175mm corner radius curvature, border symmetry, and squareness tolerance.',
    version: '2.7.0',
    inputs: ['canvas', 'corners'],
    outputs: ['widthMm', 'heightMm', 'aspectRatio', 'cornerRadiusMm', 'squarenessDeltaMm', 'withinFactorySpec'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },

  // ==========================================
  // CATEGORY 3: CORNERS, EDGES & STRUCTURAL CONDITION
  // ==========================================
  {
    id: 'corner_inspection',
    toolNumber: 11,
    categoryIndex: 3,
    name: 'Four-Corner Micro-Damage Analyzer',
    category: 'PHYSICAL_CONDITION',
    description: 'Isolates and inspects all four corners (Top-Left, Top-Right, Bottom-Left, Bottom-Right) at 600-1200 DPI for micro-whitening, rounding, crushing, delamination, and fiber exposure.',
    version: '3.8.0',
    inputs: ['canvas', 'cornerCrops'],
    outputs: ['tlScore', 'trScore', 'blScore', 'brScore', 'cornerSubgrade', 'evidenceCrops', 'defectsList'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'edge_inspection',
    toolNumber: 12,
    categoryIndex: 3,
    name: 'Four-Edge Micro-Chipping Inspector',
    category: 'PHYSICAL_CONDITION',
    description: 'Inspects full 360-degree card perimeter across Top, Bottom, Left, and Right edges. Detects micro-chipping, silvering, rough cuts, blade nicks, and builds an interactive edge heatmap.',
    version: '3.4.0',
    inputs: ['canvas', 'edgeThreshold'],
    outputs: ['topEdgeScore', 'bottomEdgeScore', 'leftEdgeScore', 'rightEdgeScore', 'edgeSubgrade', 'edgeHeatmap'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'edge_profile',
    toolNumber: 13,
    categoryIndex: 3,
    name: 'Edge Profile & Consistency Analysis',
    category: 'PHYSICAL_CONDITION',
    description: 'Analyzes cutting blade striation patterns, bevel angle consistency, and perimeter thickness. Detects recutting, mechanical trimming, shaving, and counterfeit die-cutter profiles.',
    version: '2.6.0',
    inputs: ['edgeProfiles', 'striationResolution'],
    outputs: ['recuttingProbability', 'bladePatternUniformity', 'trimmingDetected', 'edgeConsistencyScore'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'surface_damage',
    toolNumber: 14,
    categoryIndex: 3,
    name: 'Surface Damage Scanner',
    category: 'PHYSICAL_CONDITION',
    description: 'High-detail surface damage mapper identifying micro-scratches, foil scuffs, indentations, pinholes, print lines, roller marks, creases, fingernail dents, and stains with coordinate bounding boxes.',
    version: '3.9.0',
    inputs: ['canvas', 'lightingChannel', 'sensitivity'],
    outputs: ['defectsMapped', 'scratchCount', 'dentCount', 'surfaceSubgrade', 'numberedEvidenceMarkers'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'gloss_texture',
    toolNumber: 15,
    categoryIndex: 3,
    name: 'Gloss / Texture / Surface Pattern Analysis',
    category: 'PHYSICAL_CONDITION',
    description: 'Evaluates surface coating luster, gloss uniformity, cardstock texture ridges, holographic micro-etched fingerprint patterns, and detects artificial chemical smoothing or polishing.',
    version: '2.9.0',
    inputs: ['canvas', 'specularAngle'],
    outputs: ['glossUniformityPct', 'textureFidelityIndex', 'chemicalPolishingDetected', 'lusterScore'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },

  // ==========================================
  // CATEGORY 4: PRINT, AUTHENTICITY & COUNTERFEIT FORENSICS
  // ==========================================
  {
    id: 'print_registration',
    toolNumber: 16,
    categoryIndex: 4,
    name: 'Print Registration & Rosette Analysis',
    category: 'PRINT_AUTHENTICITY',
    description: 'Analyzes 4-color CMYK offset lithography screen angles, halftone rosette dot matrices, layer registration displacement, and distinguishes genuine offset presses from digital inkjet/toner.',
    version: '3.7.0',
    inputs: ['canvas', 'highResRegion'],
    outputs: ['rosettePatternVerified', 'inkjetDitherDetected', 'cmykAlignmentErrorMm', 'printSubgrade'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'typography_font',
    toolNumber: 17,
    categoryIndex: 4,
    name: 'Typography / Font & Kerning Analysis',
    category: 'PRINT_AUTHENTICITY',
    description: 'Verifies character glyph geometry, font vector line weights, copyright symbols (©), energy symbol alignments, and card numbering typography against canonical Nintendo/WotC master vector assets.',
    version: '3.2.0',
    inputs: ['canvas', 'ocrTextRegions', 'fontBaselineRef'],
    outputs: ['fontKerningHashDistance', 'glyphMatchesGenuine', 'copyrightSpacingPassed', 'typographyScore'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'ink_density',
    toolNumber: 18,
    categoryIndex: 4,
    name: 'Ink / Color / Print Density Analysis',
    category: 'PRINT_AUTHENTICITY',
    description: 'Analyzes color saturation curves, ink density gradients, RGB channel separation, and computes color histogram delta against calibrated genuine exemplars with UV aging tolerance.',
    version: '3.0.0',
    inputs: ['canvas', 'referenceCanvas'],
    outputs: ['colorHistogramDeltaPct', 'rgbChannelSeparation', 'inkSaturationCurve', 'colorFidelityPassed'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'holo_foil',
    toolNumber: 19,
    categoryIndex: 4,
    name: 'Holographic / Foil Pattern Analysis',
    category: 'PRINT_AUTHENTICITY',
    description: 'Validates holographic diffraction grating: Cosmos foil swirl presence, rainbow refraction angle, vertical foil layer sheen, etched micro-fingerprint texture, and counterfeit rainbow sheen anomalies.',
    version: '2.8.0',
    inputs: ['canvas', 'foilVariantType'],
    outputs: ['holoDiffractionMatches', 'etchedTexturePresent', 'foilBleedDetected', 'foilIntegrityScore'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'authenticity_detector',
    toolNumber: 20,
    categoryIndex: 4,
    name: 'Authenticity Anomaly Detector',
    category: 'PRINT_AUTHENTICITY',
    description: 'Synthesizes all forensic indicators into official classification: AUTHENTIC, LIKELY AUTHENTIC, SUSPICIOUS, LIKELY COUNTERFEIT, COUNTERFEIT, or INCONCLUSIVE with itemized evidence matrix.',
    version: '4.0.0',
    inputs: ['allOpticalEvidence', 'referenceMatchData'],
    outputs: ['verdict', 'counterfeitRiskScore', 'confidencePct', 'passingIndicators', 'suspiciousFlags', 'failedChecks'],
    permissions: 'GRADER',
    enabled: true,
    isAiCallable: true
  },

  // ==========================================
  // CATEGORY 5: GRADING, DAMAGE SCORING & VCA DECISION ENGINE
  // ==========================================
  {
    id: 'defect_mapping',
    toolNumber: 21,
    categoryIndex: 5,
    name: 'Defect Mapping & Severity Engine',
    category: 'GRADING_DECISION',
    description: 'Compiles normalized coordinate (0-1) pinboard of all defects with numbered markers (01, 02...). Enables human grader to confirm, reject, add manual findings, or adjust deduction weights.',
    version: '3.3.0',
    inputs: ['autoDetectedDefects', 'humanAnnotations'],
    outputs: ['defectPinboard', 'totalDeductionPoints', 'severityBreakdown', 'annotatedCardOverlay'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'condition_scoring',
    toolNumber: 22,
    categoryIndex: 5,
    name: 'Professional Condition Scoring',
    category: 'GRADING_DECISION',
    description: 'Calculates independent subgrades: Centering (20%), Corners (25%), Edges (25%), Surface (20%), and Print (10%) with weakest-subgrade floor rule and produces final VCA 10-point grade.',
    version: '4.1.0',
    inputs: ['subgrades', 'policyRules'],
    outputs: ['overallGrade', 'gradeLabel', 'subgradesSummary', 'subgradeFloorsApplied'],
    permissions: 'GRADER',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'reference_analyzer',
    toolNumber: 23,
    categoryIndex: 5,
    name: 'Comparative Reference Analyzer',
    category: 'GRADING_DECISION',
    description: 'Side-by-side synchronized zoom viewer, 50/50 split wiper slider, flicker comparison, and differential magnifier comparing specimen against authenticated canonical exemplar.',
    version: '3.5.0',
    inputs: ['specimenCanvas', 'canonicalMasterRef', 'syncZoom'],
    outputs: ['splitViewActive', 'structuralSimilarityIndex', 'zoomSynchronized', 'referenceId'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'final_report',
    toolNumber: 24,
    categoryIndex: 5,
    name: 'Final Authentication & Grade Report',
    category: 'GRADING_DECISION',
    description: 'Generates comprehensive forensic inspection dossier: Card metadata, high-resolution evidence crops, defect table, subgrades, final VCA grade, grader signature, and timestamp.',
    version: '3.6.0',
    inputs: ['cardIdentification', 'subgrades', 'defects', 'authVerdict', 'graderReview'],
    outputs: ['reportJson', 'dossierSummary', 'immutableAuditPacket', 'publicVerificationReady'],
    permissions: 'SENIOR_GRADER',
    enabled: true,
    isAiCallable: true
  },
  {
    id: 'master_dashboard',
    toolNumber: 25,
    categoryIndex: 5,
    name: 'VCA Master Forensic Dashboard',
    category: 'GRADING_DECISION',
    description: 'Central command console uniting all 25 tools. Coordinates the end-to-end forensic pipeline: Ingestion -> Quality Gate -> CV Rectification -> 25 Tools -> Grader Approval -> Ledger -> Slab.',
    version: '5.0.0',
    inputs: ['inspectionSessionId', 'activeCard'],
    outputs: ['pipelineStatus', 'toolsCompletedCount', 'readyForCertification', 'sessionLocked'],
    permissions: 'OPERATOR',
    enabled: true,
    isAiCallable: true
  }
];

// Lookup helpers
export function getToolById(id: string): VcaForensicAgentTool | undefined {
  return VCA_FORENSIC_TOOLS.find((t) => t.id === id);
}

export function getToolsByCategory(category: VcaToolCategory): VcaForensicAgentTool[] {
  return VCA_FORENSIC_TOOLS.filter((t) => t.category === category);
}

export function getToolsByCategoryIndex(index: 1 | 2 | 3 | 4 | 5): VcaForensicAgentTool[] {
  return VCA_FORENSIC_TOOLS.filter((t) => t.categoryIndex === index);
}
