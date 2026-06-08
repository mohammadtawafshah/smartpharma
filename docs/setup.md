# SmartPharma Guide — Setup & First Steps

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| PostgreSQL | 15+ | https://www.postgresql.org/download |
| Git | any | https://git-scm.com |

---

## Phase 1 — Database

### 1. Create the database and user

```sql
-- Run in psql as superuser (postgres)
CREATE USER smartpharma_user WITH PASSWORD 'your_password_here';
CREATE DATABASE smartpharma OWNER smartpharma_user;
GRANT ALL PRIVILEGES ON DATABASE smartpharma TO smartpharma_user;
```

### 2. Run the schema

```bash
psql -U smartpharma_user -d smartpharma -f database/schema.sql
```

### 3. Seed default alert rules

```bash
psql -U smartpharma_user -d smartpharma -f database/seeds/alert_rules.sql
```

### 4. Import your drug CSV

Edit `database/import/import_drugs.sql` — replace the `\COPY` path with your actual CSV file path.

```bash
psql -U smartpharma_user -d smartpharma -f database/import/import_drugs.sql
```

---

## Phase 2 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set PGPASSWORD, JWT_SECRET

npm install
npm run dev
# API running at http://localhost:5000
```

### Test the API

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","full_name":"Test User"}'

# Search
curl "http://localhost:5000/api/search?q=aspirin"
```

---

## Phase 3 — Frontend

```bash
# From the project root
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom @tanstack/react-query tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm run dev
# Frontend running at http://localhost:3000
```

### Tailwind config — add to `tailwind.config.js`

```js
content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
```

### Add to `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Implementation Order

### Week 1 — Foundation
- [ ] Database schema created and seeded
- [ ] Backend running with auth (register/login)
- [ ] Frontend skeleton with React Router
- [ ] AuthContext + protected routes

### Week 2 — Core Content
- [ ] Drugs API + DrugCard + DrugDetailPage
- [ ] Herbs API + HerbCard + HerbDetailPage
- [ ] Search API + SearchBar + SearchResultsPage

### Week 3 — Smart Features
- [ ] HealthProfilePage + API
- [ ] Alert check on drug/herb page load (AlertBanner)
- [ ] MyAlertsPage
- [ ] Favorites

### Week 4 — Admin Panel
- [ ] AdminDashboardPage
- [ ] CRUD for drugs (table + modal form)
- [ ] CRUD for herbs
- [ ] Manage interactions
- [ ] Reports page

### Week 5 — Polish
- [ ] Pagination everywhere
- [ ] Loading states + error handling
- [ ] Arabic language support (i18n)
- [ ] Mobile responsive
- [ ] Medical disclaimer in Navbar/Footer

---

## Architecture Summary

```
Browser
  │
  ├── React (port 3000)
  │     └── Axios → /api/*
  │
  └── Express (port 5000)
        ├── /api/auth
        ├── /api/drugs
        ├── /api/herbs
        ├── /api/search      ← pg_trgm similarity
        ├── /api/alerts      ← proactive alert engine
        ├── /api/profile
        ├── /api/favorites
        └── /api/admin
              │
              └── PostgreSQL (port 5432)
                    ├── users + health_profiles
                    ├── drugs  (imported from CSV)
                    ├── herbs
                    ├── drug_herb_interactions
                    ├── herbal_alternatives
                    ├── alert_rules + user_alerts
                    ├── favorites
                    ├── search_history
                    └── audit_logs
```
