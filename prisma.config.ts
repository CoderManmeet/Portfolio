import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// DATABASE_URL comes from .env locally and from Vercel env vars in production.
// It is optional here so `prisma generate` (postinstall) works before .env exists.
// migrate / seed / studio still need it set.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
