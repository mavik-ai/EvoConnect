import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/evolution';

export async function GET(req: NextRequest) {
  if (req.cookies.get('evo_admin_auth')?.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const instances = await EvolutionService.getInstances();
    return NextResponse.json({ instances });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (req.cookies.get('evo_admin_auth')?.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const result = await EvolutionService.createInstance(name);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (req.cookies.get('evo_admin_auth')?.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const result = await EvolutionService.deleteInstance(name);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
