import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type') || 'qrcode'; // 'qrcode' or 'pairing'
    const phone = searchParams.get('phone');

    if (!name) return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 });

    if (type === 'pairing') {
      if (!phone) return NextResponse.json({ error: 'Telefone é obrigatório para Pairing Code' }, { status: 400 });
      const data = await EvolutionService.getPairingCode(name, phone);
      return NextResponse.json(data);
    } else {
      const data = await EvolutionService.getConnectData(name);
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Connect Data Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
