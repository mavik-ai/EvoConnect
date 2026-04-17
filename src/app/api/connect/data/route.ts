import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';
import { systemLogger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type') || 'qrcode'; // 'qrcode' or 'pairing'
    const phone = searchParams.get('phone');

    if (!name) return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 });

    if (type === 'pairing') {
      if (!phone) return NextResponse.json({ error: 'Telefone é obrigatório para Pairing Code' }, { status: 400 });
      systemLogger.addLog(`Visitante solicitou Pairing Code para a instância ${name}`, 'info');
      const data = await EvolutionService.getPairingCode(name, phone);
      return NextResponse.json(data);
    } else {
      systemLogger.addLog(`Visitante acessou o QR Code da instância ${name}`, 'info');
      const data = await EvolutionService.getConnectData(name);
      return NextResponse.json(data);
    }
  } catch (error: any) {
    systemLogger.addLog(`Erro ao buscar dados de conexão: ${error.message}`, 'error');
    console.error('Connect Data Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
