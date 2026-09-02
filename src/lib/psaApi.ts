import dotenv from 'dotenv';
dotenv.config();

export interface PSACertResponse {
  certNumber: string;
  specNumber: string;
  brand: string;
  year: string;
  subject: string;
  cardGrade: string;
  gradeDescription: string;
  population?: number;
  populationHigher?: number;
  isAuthentic: boolean;
  rawResponse?: any;
}

/**
 * Validates a PSA Certification Number via the PSA Public API.
 * Requires PSA_API_KEY to be set in the environment.
 */
export async function getPSACertData(certNumber: string): Promise<PSACertResponse> {
  const apiKey = process.env.PSA_API_KEY;
  
  if (!apiKey) {
    console.warn("PSA_API_KEY is missing. Returning simulated PSA data.");
    return simulatePSACert(certNumber);
  }

  try {
    const response = await fetch(`https://api.psacard.com/publicapi/cert/GetByCertNumber/${certNumber}`, {
      method: "GET",
      headers: {
        "authorization": `bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`PSA API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process response based on PSA's schema
    return {
      certNumber: data.CertNumber || certNumber,
      specNumber: data.SpecNumber || '',
      brand: data.Brand || 'Unknown',
      year: data.Year || 'Unknown',
      subject: data.Subject || 'Unknown',
      cardGrade: data.CardGrade || 'Unknown',
      gradeDescription: data.GradeDescription || '',
      population: data.Population,
      populationHigher: data.PopulationHigher,
      isAuthentic: true,
      rawResponse: data
    };
  } catch (error) {
    console.error("Failed to fetch PSA Cert:", error);
    throw error;
  }
}

function simulatePSACert(certNumber: string): PSACertResponse {
  return {
    certNumber,
    specNumber: "12345678",
    brand: "Pokemon",
    year: "2016",
    subject: "Alakazam EX - Secret Rare",
    cardGrade: "10",
    gradeDescription: "Gem Mint 10",
    population: 42,
    populationHigher: 0,
    isAuthentic: true,
    rawResponse: { simulated: true }
  };
}
