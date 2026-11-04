NOTAM SETUP (one time)
1. Get free FAA NOTAM API credentials: register at https://api.faa.gov (NOTAM Search API) and copy the client id and client secret.
2. In your GitHub repository: Settings > Secrets and variables > Actions > New repository secret. Create two secrets:
   FAA_NOTAM_CLIENT_ID      and      FAA_NOTAM_CLIENT_SECRET
3. Add file > Create new file, name it exactly  .github/workflows/notams.yml  and paste the contents of notams/notams-workflow.yml.
4. Actions tab > "Update NOTAMs" > Run workflow. When it shows a green check, notams/index.json is filled.
It then refreshes about every 30 minutes (GitHub may delay scheduled runs) and when you edit notams/airports.txt.
For VATSIM/simulation use only. Do not use for real-world flight planning.
