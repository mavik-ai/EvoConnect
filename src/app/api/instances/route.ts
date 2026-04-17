import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';
import { SESSION_COOKIE, verifySession, instanceToken } from '@/lib/auth';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Erro desconhecido');

function requireAuth(req: NextRequest): NextResponse | null {
  if (!verifySession(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

interface RawShape {
  instanceName?: string;
  name?: string;
  instance?: { instanceName?: string; name?: string };
  [k: string]: unknown;
}

function enrichWithToken(list: unknown): unknown {
  if (!Array.isArray(list)) return list;
  return list.map((raw: RawShape) => {
    const inner = raw?.instance ?? raw;
    const name = inner?.instanceName ?? inner?.name;
    if (!name) return raw;
    return { ...raw, _connectToken: instanceToken(name) };
  });
}

export async function GET(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  try {
    const instances = await EvolutionService.getInstances();
    return NextResponse.json({ instances: enrichWithToken(instances) });
  } catch (error: unknown) {
    return NextResponse.json({ error: errMsg(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    if (!/^[a-z0-9-]{2,64}$/.test(name)) {
      return NextResponse.json({ error: 'Nome inválido (use letras minúsculas, números e hífens, 2-64 chars)' }, { status: 400 });
    }

    const result = await EvolutionService.createInstance(name);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: errMsg(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    if (!/^[a-z0-9-]{2,64}$/.test(name)) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }

    const result = await EvolutionService.deleteInstance(name);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: errMsg(error) }, { status: 500 });
  }
}
