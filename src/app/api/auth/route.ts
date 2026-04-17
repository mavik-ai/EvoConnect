import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, timingSafePasswordEqual } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return NextResponse.json({ isAuthenticated: verifySession(token) });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Configuração de senha do admin pendente no servidor' }, { status: 500 });
    }
    if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'SESSION_SECRET não configurado no servidor' }, { status: 500 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (typeof password !== 'string' || !timingSafePasswordEqual(password, adminPassword)) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: signSession(),
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
