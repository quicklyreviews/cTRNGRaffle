import { cookies } from 'next/headers'

export interface SessionUser {
  isAdmin: boolean
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin'
  
  if (token === adminPassword) {
    return { isAdmin: true }
  }
  
  return null
}

export async function loginAdmin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin'
  if (password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin-session', adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })
    return true
  }
  return false
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}
