import { NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

export async function GET() {
  try {
    const instances = await EvolutionService.getInstances();
    const isValid = !!instances;
    
    if (isValid) {
      return NextResponse.json({ status: 'connected', message: 'Conexão com Evolution API validada com sucesso.' });
    } else {
      return NextResponse.json({ status: 'error', message: 'Falha na conexão. Verifique EVO_URL e EVO_GLOBAL_KEY.' }, { status: 401 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
