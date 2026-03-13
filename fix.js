const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.liquid')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('.');
let imgFixed = 0;
let scriptFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add width="100%" height="auto" if missing format: <img ...>
  // Exclude if width= or height= is already present
  content = content.replace(/<img\s+(?![^>]*\b(width|height)\s*=)[^>]*>/gi, (match) => {
    // Check again to be safe
    if(match.includes('width=') || match.includes('height=')) return match;
    imgFixed++;
    // Add right before the closing >
    return match.replace(/\/?>$/, ' width="100%" height="auto"$&').replace(' width="100%" height="auto"$&', ' width="100%" height="auto"$&'.replace('$&', match.match(/\/?>$/)[0]));
  });

  // Fix ParserBlockingScript
  // Only <script ...> without defer/async and without type="module" or type="application/json"
  content = content.replace(/<script\s+(?![^>]*\b(defer|async|type)\s*=)[^>]*src=[^>]*>/gi, (match) => {
    scriptFixed++;
    return match.replace(/<script/i, '<script defer');
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Fixed imgs', imgFixed);
console.log('Fixed scripts', scriptFixed);
