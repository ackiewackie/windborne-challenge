// Simple test to verify WindBorne API data fetching
async function testAPI() {
  try {
    const response = await fetch('https://a.windbornesystems.com/treasure/00.json');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Length:', data?.length);
    console.log('First 3 items:', data?.slice(0, 3));
    
    // Test parsing
    if (Array.isArray(data)) {
      const parsed = data
        .filter(arr => Array.isArray(arr) && arr.length >= 2)
        .map(([lat, lon, alt]) => ({ lat, lon, alt }));
      
      console.log('Parsed balloons:', parsed.length);
      console.log('Sample parsed:', parsed.slice(0, 3));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();