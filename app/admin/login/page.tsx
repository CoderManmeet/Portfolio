import { Suspense } from 'react'
import { signInWithGitHub } from '@/app/admin/actions'

const MESSAGES: Record<string, string> = {
  AccessDenied: 'That GitHub account is not allowed to sign in here.',
  Configuration: 'Auth is not configured yet. Check the AUTH_* environment variables.',
}

async function LoginError({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error } = await searchParams
  const code = Array.isArray(error) ? error[0] : error
  if (!code) return null
  return <p className="notice bad">{MESSAGES[code] ?? 'Sign-in failed. Try again.'}</p>
}

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  return (
    <div className="admin admin-login">
      <div className="card">
        <h1>Admin</h1>
        <p className="muted">Manmeet Singh / portfolio</p>
        <Suspense fallback={null}>
          <LoginError searchParams={searchParams} />
        </Suspense>
        <form action={signInWithGitHub}>
          <button type="submit" className="btn primary">Sign in with GitHub</button>
        </form>
      </div>
    </div>
  )
}
