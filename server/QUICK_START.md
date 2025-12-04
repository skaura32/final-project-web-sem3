# Quick start

Development
```powershell
cd server
npm install
npm run dev
```

Run production build (serve React build from Node)
```powershell
# From project root
npm install
npm run build
cd server
npm install --only=prod
npm run start:prod
```

Notes:
- The `start:prod` script sets `NODE_ENV=production` using `cross-env` to ensure cross-platform compatibility.
- You can also run the backend directly with `npm start` (defaults to non-production).
