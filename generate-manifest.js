const fs = require('fs');
const path = require('path');

function getFramesFromDir(dirName) {
  const dirPath = path.join(__dirname, dirName);
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return [];
  }
  const files = fs.readdirSync(dirPath);
  const imgFiles = files.filter(f => /\.(jpg|jpeg|webp|png)$/i.test(f));
  
  // Numerical sort
  imgFiles.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
  
  // Encode folder name with spaces as %20
  const encodedDir = encodeURI(dirName);
  return imgFiles.map(f => `./${encodedDir}/${encodeURIComponent(f)}`);
}

const frames1 = getFramesFromDir('frames 1');
const frames2 = getFramesFromDir('frames 2');
const allFrames = [...frames1, ...frames2];

console.log(`Detected in 'frames 1': ${frames1.length} images. First: ${frames1[0]}, Last: ${frames1[frames1.length - 1]}`);
console.log(`Detected in 'frames 2': ${frames2.length} images. First: ${frames2[0]}, Last: ${frames2[frames2.length - 1]}`);
console.log(`Total sequential frames merged: ${allFrames.length}`);

// Write JSON manifest
fs.writeFileSync(
  path.join(__dirname, 'frames-manifest.json'),
  JSON.stringify({
    count: allFrames.length,
    folder1Count: frames1.length,
    folder2Count: frames2.length,
    frames1,
    frames2,
    allFrames
  }, null, 2)
);

// Also write frames-data.js so it can be loaded directly via <script> tag without fetch/CORS restrictions when opened via file:// or static server
const jsContent = `// Auto-generated frame data for VALKYRIE GT-R
window.VALKYRIE_FRAMES_DATA = ${JSON.stringify({
  count: allFrames.length,
  folder1Count: frames1.length,
  folder2Count: frames2.length,
  frames1,
  frames2,
  allFrames
}, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'frames-data.js'), jsContent);
console.log('Successfully generated frames-manifest.json and frames-data.js');
