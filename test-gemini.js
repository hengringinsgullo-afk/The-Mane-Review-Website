import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = 'AIzaSyB-vKLPiTwc9guV78DdEP7uOa-3U799vfo';

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API...');
    console.log('API Key:', GOOGLE_API_KEY.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    
    // Test 1: Text generation with Flash Lite
    console.log('\n📝 Test 1: Testing gemini-2.5-flash-lite-preview-09-2025...');
    const textModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite-preview-09-2025'
    });
    
    const textResult = await textModel.generateContent('Write a short prompt for an image about financial markets');
    const textResponse = await textResult.response;
    console.log('✅ Text generation successful!');
    console.log('Response:', textResponse.text().substring(0, 100) + '...');
    
    // Test 2: Image generation with Flash Image
    console.log('\n🎨 Test 2: Testing gemini-2.5-flash-image...');
    const imageModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image'
    });
    
    const imageResult = await imageModel.generateContent([
      {
        text: 'Generate a professional image of a stock market chart with upward trend. Modern, clean style. No text.'
      }
    ]);
    
    const imageResponse = await imageResult.response;
    console.log('✅ Image generation successful!');
    
    const candidates = imageResponse.candidates;
    if (candidates && candidates.length > 0) {
      const candidate = candidates[0];
      const content = candidate.content;
      
      if (content && content.parts && content.parts.length > 0) {
        const imagePart = content.parts.find(part => part.inlineData);
        
        if (imagePart && imagePart.inlineData) {
          console.log('✅ Image data found!');
          console.log('MIME type:', imagePart.inlineData.mimeType);
          console.log('Data length:', imagePart.inlineData.data.length);
        } else {
          console.log('❌ No image data in response');
          console.log('Parts:', JSON.stringify(content.parts, null, 2));
        }
      } else {
        console.log('❌ No content parts');
      }
    } else {
      console.log('❌ No candidates in response');
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
