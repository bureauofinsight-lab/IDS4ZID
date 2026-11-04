NOTAM SETUP (one time) - no account or API key needed
The list comes from the public FAA NOTAM Search website, fetched by a GitHub job and saved to notams/index.json.
This is unofficial: the FAA site could block GitHub's servers or change. If it fails, use "+ Add NOTAM" in the NOTAMs window to enter NOTAMs by hand.
1. Edit notams/airports.txt (FAA ids, one per line).
2. Add file > Create new file, name it exactly  .github/workflows/notams.yml  and paste the contents of notams/notams-workflow.yml.
3. Settings > Actions > General > Workflow permissions: choose "Read and write".
4. Actions tab > "Update NOTAMs" > Run workflow. A green check means notams/index.json is filled.
It refreshes about every 30 minutes (GitHub may delay scheduled runs). For VATSIM/simulation use only, not real-world flight planning.
