# Backend (Node.js + Prisma)

## 1) Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Install packages:

```bash
npm install
```

3. Sync schema and generate Prisma client:

```bash
npx prisma db push
npx prisma generate
```

4. Start backend:

```bash
npm run dev
```

Server runs on `http://localhost:4000` by default.

## 2) Main endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /prompts`
- `POST /prompts` (auth)
- `PATCH /prompts/:id` (auth)
- `POST /prompts/:id/approve` (moderator/admin)
- `POST /prompts/:id/reject` (moderator/admin)
- `POST /prompts/:id/reaction` (auth)
- `GET /prompts/:id/feedback`
- `POST /prompts/:id/feedback` (auth)
