import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('evo_admin_auth');
  return NextResponse.json({ isAuthenticated: authCookie?.value === 'true' });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Configuração de senha do admin pendente no servidor' }, { status: 500 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    
    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'evo_admin_auth',
        value: 'true',
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
      return response;
    }
    
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('evo_admin_auth');
  return response;
}
