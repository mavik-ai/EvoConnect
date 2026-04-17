import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 });

    const instances = await EvolutionService.fetchInstances();
    const instance = instances.find((i) => i.instanceName === name);

    if (!instance) {
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ 
      status: instance.status,
      isConnected: instance.status === 'open'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
