# SmartPharma Guide — Frontend Pages

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios (API calls)
- React Query (server state)
- Context API (auth state)

---

## Public Pages (no login required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Hero, search bar, featured drugs/herbs, about section |
| `/search` | `SearchResultsPage` | Results for ?q= query, filter by type |
| `/drugs/:id` | `DrugDetailPage` | Full drug info + herbal alternatives + alert banner |
| `/herbs/:id` | `HerbDetailPage` | Full herb info + drug interactions list |
| `/about` | `AboutPage` | Project description, disclaimer |
| `/login` | `LoginPage` | Login form |
| `/register` | `RegisterPage` | Registration form |

## User Pages (JWT required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `UserDashboardPage` | Quick stats: favorites, alerts, recent searches |
| `/profile/health` | `HealthProfilePage` | Fill health profile form |
| `/alerts` | `MyAlertsPage` | List of user_alerts with mark-read |
| `/favorites` | `FavoritesPage` | Saved drugs and herbs |
| `/history` | `SearchHistoryPage` | Past searches |

## Admin Pages (role = admin)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `AdminDashboardPage` | Stats: counts, last 7-day alerts |
| `/admin/drugs` | `AdminDrugsPage` | Data table + add/edit/delete modal |
| `/admin/herbs` | `AdminHerbsPage` | Data table + add/edit/delete modal |
| `/admin/interactions` | `AdminInteractionsPage` | Manage drug-herb interactions |
| `/admin/alert-rules` | `AdminAlertRulesPage` | Manage proactive alert rules |
| `/admin/reports` | `AdminReportsPage` | Top searches + alert stats charts |
| `/admin/users` | `AdminUsersPage` | List users, change roles |

---

## Key Components

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          ← search bar, login/logout, alerts bell
│   │   ├── Footer.jsx          ← disclaimer always visible
│   │   └── AdminSidebar.jsx
│   ├── common/
│   │   ├── AlertBanner.jsx     ← shows danger/warning alerts on drug/herb pages
│   │   ├── SearchBar.jsx       ← shared search input
│   │   ├── DrugCard.jsx
│   │   ├── HerbCard.jsx
│   │   ├── Pagination.jsx
│   │   └── Spinner.jsx
│   └── forms/
│       ├── DrugForm.jsx
│       ├── HerbForm.jsx
│       └── HealthProfileForm.jsx
├── pages/             ← one file per route above
├── context/
│   └── AuthContext.jsx        ← stores JWT, user object
├── hooks/
│   ├── useAuth.js
│   └── useAlerts.js           ← calls /api/alerts/check on drug/herb pages
├── services/
│   └── api.js                 ← Axios instance with base URL + auth header
└── utils/
    └── alertColors.js         ← maps severity → Tailwind color classes
```
