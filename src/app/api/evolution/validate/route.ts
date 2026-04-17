import { NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

export async function GET() {
  try {
    const isValid = await EvolutionService.validateConnection();
    
    if (isValid) {
      return NextResponse.json({ status: 'connected', message: 'Conexão com Evolution API validada com sucesso.' });
    } else {
      return NextResponse.json({ status: 'error', message: 'Falha na conexão. Verifique EVO_URL e EVO_GLOBAL_KEY.' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
