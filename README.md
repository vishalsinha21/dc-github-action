
<p align="center">
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

# Dynamic checklist

Tests are nice, but they are not written for everything, especially when they seem obvious. 

For example, it's a best practice to close resources in finally block but this is not usually tested through a test case.

Or may be you are creating index, which is ok if it's a small table, but it should be created concurrently for big tables so that rows are not locked for long time in production.

This action provides that safety net, or an extra set of eyes.

It will analyze the code for given keywords, given by you and will create a point in the checklist if that keyword is found in the code.

You can have multiple keywords map to same comment.

And that's the only input for this action. A mapping file which contains mapping of keywords to comments.

Example mapping.json

```
{
  "mappings": [
    {
      "keywords": ["create index", "createIndex"],
      "comment": "Indexes have been created concurrently in big tables"
    },
    {
      "keywords": ["connection", "session", "CloseableHttpClient", "HttpClient"],
      "comment": "Resources have been closed in finally block or using try-with-resources"
    },
    {
      "keywords": ["RequestMapping", "GetMapping", "PostMapping", "PutMapping"],
      "comment": "Endpoint URLs exposed by application use only small case"
    },
    {
      "keywords": ["keyword1", "keyword2"],
      "comment": "Expert comment"
    }
  ]
}
```


The output of this action is a formatted checklist in md format, like this:

**Checklist:**
- [ ] Indexes have been created concurrently in big tables
- [ ] Resources have been closed in finally block or using try-with-resources
- [ ] Endpoint URLs exposed by application use only small case
- [ ] Expert comment


This action will analyze the diff of the pull request, and based on the diff and mapping file given by you, will comment on the PR with dynamic checklist, hence the name.

Example to configure it:

```
on:
  pull_request:
    branches: [ master ]

jobs:
  checklist_job:
    runs-on: ubuntu-latest
    name: A job to create dynamic checklist
    steps:
      - uses: actions/checkout@v2
        with:
          ref: ${{ github.head_ref }}
      - name: Dynamic checklist action
        id: dynamic_checklist
        uses: vishalsinha21/dc-github-action@v4
        with:
          mappingFile: 'mapping.json'
        env:
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      - name: Get the output checklist
        run: echo "The final checklist ${{ steps.dynamic_checklist.outputs.checklist }}"

```

