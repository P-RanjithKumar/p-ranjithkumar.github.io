import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, '../shreyy_photos');
const outputDir = path.resolve(__dirname, '../public/photos');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  try {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
    
    console.log(`Found ${imageFiles.length} images to optimize...`);
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const inputPath = path.join(inputDir, file);
      const photoNumber = i + 1;
      const outputPath = path.join(outputDir, `photo_${photoNumber}.webp`);
      
      console.log(`Optimizing ${file} -> photo_${photoNumber}.webp`);
      
      const goodPhotos = [10, 13, 14];
      const shouldRotate = !goodPhotos.includes(photoNumber);
      
      let imagePipeline = sharp(inputPath);
      
      if (shouldRotate) {
        // Rotate 90 degrees clockwise before resizing
        imagePipeline = imagePipeline.rotate(90);
      }
      
      await imagePipeline
        .resize(600, 800, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
    }
    
    console.log('Optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();
