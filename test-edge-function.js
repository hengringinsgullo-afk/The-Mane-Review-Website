// Test the Supabase Edge Function for Gemini Image Generation

const SUPABASE_URL = 'https://dlpfkrqvptlgtampkqvd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo';

async function testEdgeFunction() {
  console.log('🧪 Testing Gemini Image Edge Function...\n');

  const testArticle = {
    title: 'Test Article: Market Analysis',
    excerpt: 'A brief analysis of current market trends',
    body: 'This is a test article about market trends and financial analysis.',
    category: 'markets',
    region: 'usa',
    tags: ['stocks', 'analysis']
  };

  try {
    console.log('📤 Sending request to Edge Function...');
    console.log('URL:', `${SUPABASE_URL}/functions/v1/gemini-image/generate`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-image/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testArticle)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error response:', data);
      return;
    }

    console.log('\n✅ Success!');
    console.log('Generated prompt:', data.prompt);
    console.log('Image URL length:', data.imageUrl?.length || 0);
    console.log('Image URL preview:', data.imageUrl?.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEdgeFunction();
