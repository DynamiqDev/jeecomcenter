# JEE Command Center (PWA)

React + Vite + Tailwind CSS + Recharts + vite-plugin-pwa. All data is stored in your browser (localStorage), nothing leaves your machine.

## Run
1. Install Node.js 18+ from https://nodejs.org
2. In this folder:
   npm install
   npm run dev          # development at http://localhost:5173

## Install as an app (PWA)
   npm run build
   npm run preview      # http://localhost:4173
Open it in Chrome or Edge and click the install icon in the address bar. It then works offline.

## Notes
- Data lives in the browser profile you used. Use the same URL/port each time.
- Click status tags (schedule, syllabus) to cycle them.
