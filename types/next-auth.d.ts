import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: { githubId?: string } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    githubId?: string
  }
}
