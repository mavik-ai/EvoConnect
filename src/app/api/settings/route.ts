import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings, EvolutionService } from '@/lib/evolution';

export async function GET(req: NextRequest) {
  if (req.cookies.get('evo_admin_auth')?.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const current = getSettings();
  
  // Omit details for security, just tell frontend if it's configured
  return NextResponse.json({ 
    isConfigured: !!(current.url && current.globalKey),
    isEnvManaged: !!(process.env.EVO_URL && process.env.EVO_GLOBAL_KEY)
  });
}

export async function POST(req: NextRequest) {
  if (req.cookies.get('evo_admin_auth')?.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url, globalKey } = await req.json();

    if (!url || !globalKey) {
      return NextResponse.json({ error: 'Faltando chaves.' }, { status: 400 });
    }

    const isValid = await EvolutionService.validateConnection(url, globalKey);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciais inválidas ou Evolution offline.' }, { status: 401 });
    }

    const saved = saveSettings({ url, globalKey });
    if (!saved) {
      return NextResponse.json({ error: 'Falha ao salvar localmente. Tente usar ENV vars.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
