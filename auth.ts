import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

// Single-admin setup: only the GitHub account whose numeric id equals ADMIN_GITHUB_ID can sign in.
// JWT sessions, no database adapter.

function githubIdFrom(profile: unknown, providerAccountId?: string): string | undefined {
  const id = (profile as { id?: string | number } | undefined)?.id ?? providerAccountId
  return id === undefined || id === null ? undefined : String(id)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    signIn({ account, profile }) {
      const adminId = process.env.ADMIN_GITHUB_ID
      if (!adminId || account?.provider !== 'github') return false
      return githubIdFrom(profile, account.providerAccountId) === adminId
    },
    jwt({ token, account, profile }) {
      if (account?.provider === 'github') {
        token.githubId = githubIdFrom(profile, account.providerAccountId)
      }
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.githubId = typeof token.githubId === 'string' ? token.githubId : undefined
      return session
    },
  },
})
