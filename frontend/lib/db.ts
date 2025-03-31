const API_URL = 'http://localhost:5001/api';

export async function fetchAISummaries(outcomeName: string) {
  try {
    const response = await fetch(`${API_URL}/summaries?outcome=${outcomeName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching summaries:', error);
    throw error; // Let the component handle the error
  }
} 