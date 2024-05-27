import { NextRequest, NextResponse } from 'next/server'
import { isValidPassword } from './lib/isValidPassword'

export async function middleware(req: NextRequest) {
  if ((await isAuthenticated(req)) === false) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic',
      },
    })
  }
}

async function isAuthenticated(req: NextRequest) {
  //   return Promise.resolve(false)
  const authHeader =
    req.headers.get('authorization') || req.headers.get('Authorization')

  if (authHeader == null) return false

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':')

  return (
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(
      password,
      process.env.ADMIN_HASHED_PASSWORD as string
    ))
  )

  //   console.log(username, password)
}

export const config = {
  matcher: '/admin/:path*',
}
