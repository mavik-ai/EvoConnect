import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';
import { systemLogger } from '@/lib/logger';

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

    const isConnected = instance.status === 'open';
    
    // We don't want to log this every 5 seconds, only log if state changed (but we are stateless here so we can't easily detect edge).
    // As a workaround, we won't log the "isConnected" from the polling status interval directly to avoid spamming the terminal.
    // Instead, we just return the status. The actual webhook would be better for this in production.

    return NextResponse.json({ 
      status: instance.status,
      isConnected
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
