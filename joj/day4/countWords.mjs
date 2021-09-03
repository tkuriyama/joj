import fs from 'fs';
export { countWordsInFile };

function countWordsInFile(file) {
   const fileBuffer = fs.readFileSync(file);
   const wordsString = fileBuffer.toString();
   const wordsInArray = wordsString.split(/\s+/);
   return wordsInArray.length;
}

console.log(countWordsInFile('sample.txt'));
