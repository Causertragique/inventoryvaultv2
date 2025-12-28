const fs = require('fs');
const path = 'client/pages/Login.tsx';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
const replaceLine = (needle, replacement) => {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      lines[i] = replacement;
      return i;
    }
  }
  throw new Error(line not found for );
};
replaceLine('<h1 className= text-5xl font-bold text-gray-900 mb-2>', '              <h1 className=text-5xl font-bold text-gray-900 mb-2>{title}</h1>');
replaceLine('<p className=text-xl text-amber-700>', '              <p className=text-xl text-amber-700>{tagline}</p>');
const mobileIdx = replaceLine('<div className=lg:hidden text-center mb-4>', '            <div className=lg:hidden text-center mb-4>');
lines[mobileIdx + 1] = '              <h1 className=text-3xl font-bold text-gray-900>{title}</h1>';
lines[mobileIdx + 2] = '              <p className=text-sm text-amber-700>{tagline}</p>';
fs.writeFileSync(path, lines.join('\n'), 'utf8');
