NOTAMs - no account or API key needed
1. Edit notams/airports.txt (FAA ids, one per line).
2. Add file > Create new file, name it exactly  .github/workflows/notams.yml  and paste the contents of notams/notams-workflow.yml.
3. Settings > Actions > General > Workflow permissions: choose "Read and write".
4. Actions tab > "Update NOTAMs" > Run workflow.
The job tries the public FAA NOTAM Search site, then the DoD DINS site. Both are unofficial and may block GitHub's servers.
If the run fails (red X), disable it: Actions > Update NOTAMs > ... menu > Disable workflow. Then use the NOTAMs window:
  - "Paste NOTAMs": copy NOTAM text from notams.aim.faa.gov and paste it in (saved in your browser only).
  - "+ Add NOTAM": enter one by hand.
For VATSIM/simulation use only, not real-world flight planning.
