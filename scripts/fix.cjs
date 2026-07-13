const fs = require('fs');
let c = fs.readFileSync('src/data/components.ts','utf8');
c = c.replace(/imageUrl: \`\/components\/\$COMP_ID\.jpg\`/g, (m, offset, str) => { 
  let match = str.substring(0, offset).match(/id:\s*'([^']+)'/g); 
  if(match) { 
    let id = match[match.length-1].match(/id:\s*'([^']+)'/)[1]; 
    return `imageUrl: '/components/${id}.jpg'`; 
  } 
  return m; 
}); 
fs.writeFileSync('src/data/components.ts', c);
