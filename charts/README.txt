CHART LIST SETUP (one time)
1. Edit charts/airports.txt (airports to include, or STATE:IN,OH,KY for whole states).
2. In your GitHub repository: Add file > Create new file. Name it exactly:  .github/workflows/charts.yml
   Paste the contents of charts/charts-workflow.yml into it and commit.
3. Open the repository's Actions tab, choose "Update FAA charts index", click Run workflow.
   If asked, enable Actions. In Settings > Actions > General > Workflow permissions choose "Read and write".
4. After it finishes (green check), charts/index.json is filled in. It updates itself every Monday and
   whenever you edit charts/airports.txt.
