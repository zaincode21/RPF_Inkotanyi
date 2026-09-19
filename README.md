# FPR Inkotanyi Member Portal

Single-party member system for the **Front Patriotique Rwandais (FPR) Inkotanyi** — the Rwandan Patriotic Front.  
This portal manages **only FPR Inkotanyi** members, events, attendance, news, achievements, and official resources.

Official site: [rpfinkotanyi.rw](https://rpfinkotanyi.rw/)

## Notes
- PostgreSQL database: `party` (create with `CREATE DATABASE party;`)
- Backend credentials are configured in `backend/.env`

---

## Run Locally

### Prerequisites
- Node.js 20+
- PostgreSQL running locally with the `party` database created

### Backend
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```
Backend runs at http://localhost:8090.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:3000 (proxies `/api` to the backend).

---

## Default Accounts (seeded on first start)

| Email                         | Password    | Role   |
|-------------------------------|-------------|--------|
| leader@rpfinkotanyi.rw        | leader123   | Leader |
| admin@rpfinkotanyi.rw         | admin123    | Leader |
| member@rpfinkotanyi.rw        | member123   | Member |
| pending@rpfinkotanyi.rw       | password123 | Member (not approved) |
