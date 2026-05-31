import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/studio')) return NextResponse.next()

  const auth = req.headers.get('authorization')
  const password = process.env.STUDIO_PASSWORD

  // If no password is set, allow access (dev mode)
  if (!password) return NextResponse.next()

  if (auth) {
    const [, encoded] = auth.split(' ')
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    const [, pwd] = decoded.split(':')
    if (pwd === password) return NextResponse.next()
  }

  return new NextResponse('Zugang verweigert', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Nippon Diary Studio"',
    },
  })
}

export const config = {
  matcher: '/studio/:path*',
}
