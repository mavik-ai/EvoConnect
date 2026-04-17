import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';
import { verifyInstanceToken } from '@/lib/auth';

interface EvoInstanceShape {
  instanceName?: string;
  name?: string;
  status?: string;
  connectionStatus?: string;
  instance?: EvoInstanceShape;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const token = searchParams.get('t');

    if (!name) return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 });
    if (!verifyInstanceToken(name, token ?? undefined)) {
      return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 403 });
    }

    const instances: EvoInstanceShape[] = await EvolutionService.getInstances();
    const found = instances.find((i) => {
      const inner = i.instance ?? i;
      return (inner.instanceName ?? inner.name) === name;
    });

    if (!found) {
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    const inner = found.instance ?? found;
    const status = inner.status ?? inner.connectionStatus ?? 'close';
    const isConnected = status === 'open';

    return NextResponse.json({ status, isConnected });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
