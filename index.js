const core = require('@actions/core');
const wait = require('./wait');
const github = require('@actions/github');
const data = require('./mapping.json');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const mappings = data.mappings
    console.log('mappings: ')
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
    console.log(prResponse)

    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    const checklist = getFinalChecklist(prResponse.data, mappings);
    console.log(checklist)

    octokit.issues.createComment({
      issue_number: context.payload.pull_request.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: checklist
    })

    core.setOutput('checklist', checklist);
  } catch (error) {
    core.setFailed(error.message);
  }
}


function getFinalChecklist(diff, mappings) {
  let checklist = getChecklist(diff, mappings);
  let formattedChecklist = getFormattedChecklist(checklist);
  return formattedChecklist;
}


function getChecklist(diff, mappings) {
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


function getFormattedChecklist(checklist) {
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
