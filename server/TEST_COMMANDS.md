# Test Commands for Student Flows (PowerShell & curl)

These commands test the student flows: register, login, view/search courses, register for courses, view registrations, and post messages.

Replace BASE_URL with `http://localhost:5000` (or `http://127.0.0.1:5000`) depending on your environment.

---

## Start the backend (PowerShell)

```
cd C:\Users\taran\OneDrive\Documents\GitHub\final-project-web-sem3\server
$Env:DB_USE_SQL='true'
$Env:DB_SERVER='TARAN\SQLEXPRESS'
$Env:DB_NAME='bowdb'
$Env:DB_USER='taranjot'
$Env:DB_PASS='Taran'
$Env:DB_TRUSTED='false'
$Env:JWT_SECRET='change_me_for_dev'
node index.js
```

Leave this terminal open.

---

## Register (PowerShell)

```
$body = @{
  firstName = 'Auto'
  lastName = 'Tester'
  email = 'auto.test+$(Get-Random -Maximum 9999)@example.com'
  username = 'autotest' + (Get-Random -Maximum 10000)
  password = 'pass1234'
  program = 'SD'
  role = 'student'
} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method Post -Body $body -ContentType 'application/json'
```

## Register (curl)

```
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"firstName":"Auto","lastName":"Tester","email":"auto.test@example.com","username":"autotest","password":"pass1234","program":"SD","role":"student"}'
```

---

## Login (PowerShell)

```
$body = @{ username = 'autotest'; password='pass1234' } | ConvertTo-Json
$res = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $body -ContentType 'application/json'
$token = $res.token
```

## Login (curl)

```
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"autotest","password":"pass1234"}'
```

---

## Get courses (PowerShell)

```
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:5000/api/courses -Method Get -Headers $headers
```

## Get courses (curl)

```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/courses
```

---

## Search courses

- GET /api/courses?q=web

Example (PowerShell):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/courses?q=web" -Method Get -Headers $headers
```

---

## Register for courses (POST /api/registrations)

Example payload:
```
{
  "term": "Fall",
  "courses": ["SD101"]
}
```

PowerShell:
```
$body = @{ term = 'Fall'; courses = @('SD101') } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/registrations -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

---

## View registrations

```
Invoke-RestMethod -Uri http://localhost:5000/api/registrations/Fall -Method Get -Headers $headers
```

---

## Post a message (POST /api/messages)

```
$body = @{ subject = 'Test subject'; message = 'Hello from PowerShell' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/messages -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

## Get my messages

```
Invoke-RestMethod -Uri "http://localhost:5000/api/messages?mine=true" -Method Get -Headers $headers
```

---

## Troubleshooting

- If you see `ECONNREFUSED`:
  - Confirm server is running in the server terminal with `node index.js`.
  - Test `Invoke-RestMethod -Uri http://localhost:5000/` to see welcome response.
  - If ping or test connection fails, try `localhost` instead of `127.0.0.1`.
  - Confirm `netstat -aon | findstr :5000` shows a `LISTENING` row and note the PID.
  - Ensure firewall isn't blocking port 5000 for local connections.

- If verify fails with SQL errors:
  - Confirm migration: `npm run migrate` executed with SQL env variables and created tables.
  - Examine `Messages` column names (should include `is_read` not `read`).
  - You can run `sqlcmd` to check columns:
    `sqlcmd -S TARAN\SQLEXPRESS -U taranjot -P Taran -d bowdb -Q "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name='Messages'"
`

---

If you'd like, I can also create a Postman collection file with exports for these operations. Let me know and I will add it to the workspace.
