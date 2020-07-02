const getFinalChecklist = (diff, mappings) => {
  let checklist = getChecklist(diff, mappings);
  let formattedChecklist = getFormattedChecklist(checklist);
  return formattedChecklist;
}


const getChecklist = (diff, mappings) => {
  let checklist = []
  const diffInLowerCase = diff.toLowerCase();

  mappings.forEach(mapping => {
    const keywords = mapping.keywords
    for (let i = 0; i < keywords.length; i++) {
      if (diffInLowerCase.includes(keywords[i].toLowerCase())) {
        checklist.push(mapping.comment)
        break;
      }
    }
  })
  return checklist;
}


const getFormattedChecklist = (checklist) => {
  let formattedChecklist = '';
  if (checklist.length > 0) {
    formattedChecklist = '**Checklist:**'

    for (let i = 0; i < checklist.length; i++) {
      formattedChecklist += '\n';
      formattedChecklist += '- [ ] ' + checklist[i];
    }
  }
  return formattedChecklist;
}

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


module.exports = {
  getFinalChecklist: getFinalChecklist,
  getOnlyAddedLines: getOnlyAddedLines
};