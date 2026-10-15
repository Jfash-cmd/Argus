import { NextRequest, NextResponse } from 'next/server';
import { runIngestionPipeline } from '@/services/pipeline';
import { generateAndSendDigests } from '@/services/telegramDigest';

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json().catch(() => ({ action: 'scrape' }));

    if (action === 'digest') {
      const sent = await generateAndSendDigests(24);
      return NextResponse.json({ success: true, action: 'digest', sentUsers: sent });
    }

    const result = await runIngestionPipeline();
    return NextResponse.json({ success: true, action: 'scrape', result });
  } catch (err: any) {
    console.error('Trigger API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
