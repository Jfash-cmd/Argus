import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const telegramId = req.cookies.get('argon_telegram_id')?.value;
    if (!telegramId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { telegram_id: telegramId },
      include: { filter: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        chat_id: user.chat_id,
        first_name: user.first_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_token: user.auth_token,
      },
      filter: {
        keywords: JSON.parse(user.filter?.keywords || '[]'),
        categories: JSON.parse(user.filter?.categories || '[]'),
        min_prize: user.filter?.min_prize ?? 0,
      },
    });
  } catch (err: any) {
    console.error('API Error GET /api/user/filters:', err);
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const telegramId = req.cookies.get('argon_telegram_id')?.value;
    if (!telegramId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { keywords, categories, min_prize } = body;

    const updated = await prisma.filter.upsert({
      where: { user_id: user.id },
      update: {
        keywords: JSON.stringify(Array.isArray(keywords) ? keywords : []),
        categories: JSON.stringify(Array.isArray(categories) ? categories : []),
        min_prize: typeof min_prize === 'number' ? min_prize : 0,
      },
      create: {
        user_id: user.id,
        keywords: JSON.stringify(Array.isArray(keywords) ? keywords : []),
        categories: JSON.stringify(Array.isArray(categories) ? categories : []),
        min_prize: typeof min_prize === 'number' ? min_prize : 0,
      },
    });

    return NextResponse.json({
      success: true,
      filter: {
        keywords: JSON.parse(updated.keywords),
        categories: JSON.parse(updated.categories),
        min_prize: updated.min_prize,
      },
    });
  } catch (err: any) {
    console.error('API Error POST /api/user/filters:', err);
    return NextResponse.json({ error: 'Failed to update filters' }, { status: 500 });
  }
}
