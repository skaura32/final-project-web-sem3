# Backend Setup (SQL)

This backend supports either JSON-file storage (default) or SQL Server storage (recommended for assignment). To enable SQL Server, set environment variables as described in `.env.example`.

Steps to configure and run with SQL Server:

1. Install dependencies:
```powershell
cd server
npm install
```

2. Configure your `.env` (copy `.env.example`) and set the following (example uses Windows Integrated Auth):
```
DB_USE_SQL=true
DB_SERVER=TARAN\SQLEXPRESS
DB_NAME=bowdb
DB_TRUSTED=true
JWT_SECRET=your_secret_here
```

3. Ensure ODBC driver is installed (ODBC Driver 18 or 17 for SQL Server) and Node native driver `msnodesqlv8` is installed (already in package.json). If you intend to use SQL Authentication (user/password), set DB_USER and DB_PASS and DB_TRUSTED=false.

4. Run the migration & seed script to create `bowdb` and seed content (Programs, Courses, Users).
```powershell
cd server
npm run migrate
```

5. Start the backend server
```powershell
npm start
```

6. Verify endpoints using PowerShell or Postman
```powershell
# Health
Invoke-RestMethod http://localhost:5000/
# Register a new test user
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method POST -Body (ConvertTo-Json @{ firstName='Demo'; lastName='User'; email='demo@bow.ca'; username='demouser'; password='demo123'; role='student'; program='SD' }) -ContentType 'application/json'
```

Notes:
- The SQL code uses parameterized queries to prevent SQL injection.
- If the SQL Server is not reachable or `DB_USE_SQL` is not set, the server will fallback to JSON file storage under `server/data`.
- For Windows Integrated Authentication the server must be able to resolve your Windows account; otherwise, create a SQL-auth user and set DB_USER/DB_PASS.