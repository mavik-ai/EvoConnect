import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

interface EvoInstanceShape {
  instanceName?: string;
  status?: string;
  instance?: { instanceName?: string; status?: string };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 });

    const instances: EvoInstanceShape[] = await EvolutionService.getInstances();
    const found = instances.find((i) => {
      const inner = i.instance ?? i;
      return inner.instanceName === name;
    });

    if (!found) {
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    const inner = found.instance ?? found;
    const isConnected = inner.status === 'open';

    return NextResponse.json({
      status: inner.status,
      isConnected
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
