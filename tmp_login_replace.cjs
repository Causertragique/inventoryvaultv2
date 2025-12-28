const fs = require('fs');
const path = 'client/pages/Login.tsx';
let text = fs.readFileSync(path, 'utf8');
const replaceFirst = (pattern, replacement) => {
  const match = text.match(pattern);
  if (!match) {
    throw new Error('pattern not found: ' + pattern);
  }
  text = text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length);
};
replaceFirst(/<h1 className= text-5xl font-bold text-gray-900 mb-2>[\s\S]*?<\/h1>/, '              <h1 className=text-5xl font-bold text-gray-900 mb-2>{title}<\/h1>');
replaceFirst(/<p className=text-xl text-amber-700>[\s\S]*?<\/p>/, '              <p className=text-xl text-amber-700>{tagline}<\/p>');
const mobilePattern = /<div className=lg:hidden text-center mb-4>[\s\S]*?<\/div>/;
const mobileReplacement = '            <div className=lg:hidden text-center mb-4>\n              <h1 className=text-3xl font-bold text-gray-900>{title}<\/h1>\n              <p className=text-sm text-amber-700>{tagline}<\/p>\n            <\/div>';
replaceFirst(mobilePattern, mobileReplacement);
fs.writeFileSync(path, text, 'utf8');
