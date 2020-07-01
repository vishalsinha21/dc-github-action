const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path')

async function run() {
  try {

    const mappingFile = core.getInput('mappingFile')
    console.log('mappingFile: ' + mappingFile)

    const filePath = path.resolve(mappingFile)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const mappings = data.mappings
    console.log('keyword to comment mappings found: ')
    console.log(mappings)

    const token = process.env.GITHUB_TOKEN || ''
    const octokit = new github.GitHub(token)
    const context = github.context;

    const prResponse = await octokit.pulls.get({
      pull_number: context.payload.pull_request.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      headers: {accept: "application/vnd.github.v3.diff"}
    });
    const prDiff = prResponse.data;
    console.log('Pull request diff:' + prDiff)

    const checklist = getFinalChecklist(prDiff, mappings);
    console.log('checklist: ' + checklist)

    if (checklist && checklist.trim().length > 0) {
      octokit.issues.createComment({
        issue_number: context.payload.pull_request.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: checklist
      })
    } else {
      console.log("No dynamic checklist was created based on code difference and mapping file")
    }

    core.setOutput('checklist', checklist);
  } catch (error) {
    core.setFailed(error.message);
  }
}


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

run()
