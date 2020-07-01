const fs = require('fs');
const path = require('path')

const filePath = path.resolve('diff.txt')
const diff = fs.readFileSync(filePath, 'utf8')

console.log(diff)

console.log('***********************')
console.log('***********************')
console.log('***********************')

const getOnlyAddedLines = diff => {
  let newLines = ''
  const arr = diff.split('\n')
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].startsWith('+')) {
      newLines = newLines.concat(arr[i], '\n')
    }
  }

  return newLines;
}
