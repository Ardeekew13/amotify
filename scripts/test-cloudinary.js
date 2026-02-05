// Test Cloudinary Configuration
// Run with: node scripts/test-cloudinary.js

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Manually load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary Configuration...\n');
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
console.log('');

// Test upload with a sample image URL
const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg';

cloudinary.uploader.upload(testImageUrl, {
  folder: 'amotify/test',
  public_id: 'test-upload',
})
  .then(result => {
    console.log('✓ Cloudinary connection successful!');
    console.log('Test image uploaded:', result.secure_url);
    console.log('\nYou can delete this test image from your Cloudinary dashboard.');
    
    // Clean up test image
    return cloudinary.uploader.destroy('amotify/test/test-upload');
  })
  .then(() => {
    console.log('✓ Test image cleaned up');
  })
  .catch(error => {
    console.error('✗ Cloudinary connection failed:');
    console.error('Error:', error.message);
    
    if (error.http_code === 401) {
      console.error('\n⚠️  Invalid credentials. Please check:');
      console.error('   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
      console.error('   - CLOUDINARY_API_KEY');
      console.error('   - CLOUDINARY_API_SECRET');
    }
  });
