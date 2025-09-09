import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = process.env.JWT_SECRET
const secretKey = new TextEncoder().encode(SECRET)

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value
    const path = req.nextUrl.pathname
    const isAuthRoute = path.startsWith('/auth');
    // If already logged in and trying to go to /auth/login, redirect to /dashboard
    if (isAuthRoute) {
        if (token) {
          try {
            const { payload } = await jwtVerify(token, secretKey)
            const role = (payload.role as string).toUpperCase()
      
            const dashboardPaths: Record<string, string> = {
              BANK_USER: '/client/dashboard',
              MANAGER: '/manager/dashboard',
            }
      
            const redirectPath = dashboardPaths[role] || '/dashboard'
            return NextResponse.redirect(new URL(redirectPath, req.url))
          } catch (err) {
            console.error('JWT verification failed:', err)
            // 👇 Just allow them to access the login page
            return NextResponse.next()
          }
        }
      
        // 👇 No token at all — allow access to login page
        return NextResponse.next()
      }
      
    // Existing logic
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  
    try {
      const { payload } = await jwtVerify(token, secretKey)
      const role = (payload.role as string).toUpperCase()
  
      const rolePaths: Record<string, string[]> = {
        BANK_USER: ['/client', '/dashboard'],
        MANAGER: ['/manager', '/dashboard'],
      }
  
      const allowedPaths = rolePaths[role] || []
  
      const isAllowed = allowedPaths.some(p => path.startsWith(p)) || path.startsWith('/dashboard')
  
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
  
      return NextResponse.next()
    } catch (err) {
      console.error('JWT verification failed:', err)
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }
  
  export const config = {
    matcher: [
      '/auth/login',
      '/client/:path*',
      '/manager/:path*',
      '/dashboard/:path*',
    ],
  }
  