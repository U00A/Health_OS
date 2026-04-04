// Drug interaction database for pharmacy verification
// Severity levels: mild (informational), moderate (acknowledge), severe (blocking)

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
}

// Common drug interactions - this is a representative sample
// In production, this would be sourced from a medical API or database
export const DRUG_INTERACTIONS: DrugInteraction[] = [
  // Severe interactions
  {
    drug1: "warfarin",
    drug2: "aspirin",
    severity: "severe",
    description: "Increased risk of bleeding. Monitor INR closely.",
  },
  {
    drug1: "warfarin",
    drug2: "ibuprofen",
    severity: "severe",
    description: "Increased risk of GI bleeding. Avoid combination.",
  },
  {
    drug1: "metformin",
    drug2: "contrast_dye",
    severity: "severe",
    description: "Risk of lactic acidosis. Hold metformin before contrast procedures.",
  },
  {
    drug1: "sildenafil",
    drug2: "nitroglycerin",
    severity: "severe",
    description: "Severe hypotension. Contraindicated.",
  },
  {
    drug1: "lisinopril",
    drug2: "spironolactone",
    severity: "severe",
    description: "Risk of hyperkalemia. Monitor potassium levels.",
  },
  {
    drug1: "ciprofloxacin",
    drug2: "theophylline",
    severity: "severe",
    description: "Increased theophylline levels. Risk of toxicity.",
  },
  {
    drug1: "amiodarone",
    drug2: "digoxin",
    severity: "severe",
    description: "Increased digoxin levels. Risk of toxicity.",
  },
  {
    drug1: "methotrexate",
    drug2: "nsaids",
    severity: "severe",
    description: "Increased methotrexate toxicity. Avoid combination.",
  },
  // Moderate interactions
  {
    drug1: "metformin",
    drug2: "alcohol",
    severity: "moderate",
    description: "Increased risk of lactic acidosis. Limit alcohol intake.",
  },
  {
    drug1: "lisinopril",
    drug2: "potassium",
    severity: "moderate",
    description: "Risk of hyperkalemia. Monitor potassium levels.",
  },
  {
    drug1: "omeprazole",
    drug2: "clopidogrel",
    severity: "moderate",
    description: "Reduced clopidogrel efficacy. Consider alternative PPI.",
  },
  {
    drug1: "fluoxetine",
    drug2: "tramadol",
    severity: "moderate",
    description: "Risk of serotonin syndrome. Monitor closely.",
  },
  {
    drug1: "amlodipine",
    drug2: "simvastatin",
    severity: "moderate",
    description: "Increased simvastatin levels. Limit simvastatin to 20mg.",
  },
  {
    drug1: "levothyroxine",
    drug2: "calcium",
    severity: "moderate",
    description: "Reduced levothyroxine absorption. Separate by 4 hours.",
  },
  {
    drug1: "ciprofloxacin",
    drug2: "antacids",
    severity: "moderate",
    description: "Reduced ciprofloxacin absorption. Separate by 2 hours.",
  },
  // Mild interactions
  {
    drug1: "aspirin",
    drug2: "ibuprofen",
    severity: "mild",
    description: "Reduced aspirin cardioprotective effect. Take aspirin first.",
  },
  {
    drug1: "metformin",
    drug2: "furosemide",
    severity: "mild",
    description: "Metformin levels may increase. Monitor renal function.",
  },
  {
    drug1: "amlodipine",
    drug2: "atorvastatin",
    severity: "mild",
    description: "Slightly increased atorvastatin levels. Generally safe.",
  },
  {
    drug1: "omeprazole",
    drug2: "magnesium",
    severity: "mild",
    description: "Long-term PPI use may reduce magnesium levels.",
  },
];

// Normalize drug name for comparison
function normalizeDrugName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_");
}

// Check for interactions between a new drug and existing medications
export function checkDrugInteractions(
  newDrug: string,
  existingDrugs: string[]
): { severity: "mild" | "moderate" | "severe"; description: string; interactingDrug: string }[] {
  const normalizedNew = normalizeDrugName(newDrug);
  const normalizedExisting = existingDrugs.map(normalizeDrugName);

  const interactions: { severity: "mild" | "moderate" | "severe"; description: string; interactingDrug: string }[] = [];

  for (const interaction of DRUG_INTERACTIONS) {
    const normDrug1 = normalizeDrugName(interaction.drug1);
    const normDrug2 = normalizeDrugName(interaction.drug2);

    // Check if new drug matches one side and existing drug matches the other
    if (
      (normalizedNew === normDrug1 && normalizedExisting.includes(normDrug2)) ||
      (normalizedNew === normDrug2 && normalizedExisting.includes(normDrug1))
    ) {
      const existingIdx = normalizedNew === normDrug1
        ? normalizedExisting.indexOf(normDrug2)
        : normalizedExisting.indexOf(normDrug1);
      interactions.push({
        severity: interaction.severity,
        description: interaction.description,
        interactingDrug: existingDrugs[existingIdx],
      });
    }
  }

  // Sort by severity (severe first)
  const severityOrder = { severe: 0, moderate: 1, mild: 2 };
  interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return interactions;
}

// Check all medications in a prescription against each other
export function checkAllInteractions(
  medications: { name: string; dose: string; frequency: string; duration: string }[]
): { severity: "mild" | "moderate" | "severe"; description: string; drug1: string; drug2: string }[] {
  const interactions: { severity: "mild" | "moderate" | "severe"; description: string; drug1: string; drug2: string }[] = [];

  for (let i = 0; i < medications.length; i++) {
    const otherDrugs = medications.filter((_, j) => j !== i).map((m) => m.name);
    const drugInteractions = checkDrugInteractions(medications[i].name, otherDrugs);
    drugInteractions.forEach((di) => {
      // Avoid duplicates
      const exists = interactions.some(
        (existing) =>
          (existing.drug1 === medications[i].name && existing.drug2 === di.interactingDrug) ||
          (existing.drug1 === di.interactingDrug && existing.drug2 === medications[i].name)
      );
      if (!exists) {
        interactions.push({
          severity: di.severity,
          description: di.description,
          drug1: medications[i].name,
          drug2: di.interactingDrug,
        });
      }
    });
  }

  return interactions;
}