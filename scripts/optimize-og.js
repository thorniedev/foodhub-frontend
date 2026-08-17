const fs = require('fs');
const path = require('path');

// Read the original thumbnail
const src = path.join(__dirname, '..', 'public', 'thumnail.png');
const stats = fs.statSync(src);
console.log(`Original size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// Check if sharp is available
try {
  require.resolve('sharp');
  console.log('sharp: available');
  
  const sharp = require('sharp');
  const destJpg = path.join(__dirname, '..', 'public', 'og-image.jpeg');
  const destPng = path.join(__dirname, '..', 'public', 'og-image.jpeg');
  
  sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80 })
    .toFile(destJpg)
    .then(info => {
      console.log(`OG JPG created: ${(info.size / 1024).toFixed(1)} KB`);
      return sharp(src)
        .resize(1200, 630, { fit: 'cover', position: 'center' })
        .png({ quality: 80 })
        .toFile(destPng);
    })
    .then(info => {
      console.log(`OG PNG created: ${(info.size / 1024).toFixed(1)} KB`);
    })
    .catch(err => console.error('Error:', err));
} catch (e) {
  console.log('sharp: NOT available');
  // Copy the original as-is, metadata will reference it directly
  console.log('Will reference thumbnail directly in metadata');
}
