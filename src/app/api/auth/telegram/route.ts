import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, first_name, username, photo_url, auth_date, hash } = data;

    if (!id) return NextResponse.json({ error: 'Missing Telegram ID' }, { status: 400 });

    const telegramId = String(id);
    const chatId = String(id);
    const existing = await prisma.user.findUnique({ where: { telegram_id: telegramId } });
    const authToken = existing?.auth_token || crypto.randomBytes(16).toString('hex');

    const user = await prisma.user.upsert({
      where: { telegram_id: telegramId },
      update: {
        chat_id: chatId,
        first_name: first_name || null,
        username: username || null,
        photo_url: photo_url || null,
        auth_date: auth_date ? Number(auth_date) : null,
        auth_token: authToken,
      },
      create: {
        telegram_id: telegramId,
        chat_id: chatId,
        first_name: first_name || null,
        username: username || null,
        photo_url: photo_url || null,
        auth_date: auth_date ? Number(auth_date) : null,
        auth_token: authToken,
        filter: {
          create: { keywords: '[]', categories: '[]', min_prize: 0 },
        },
      },
      include: { filter: true },
    });

    const res = NextResponse.json({ success: true, user, authToken });
    res.cookies.set('argon_telegram_id', telegramId, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    console.error('API Error /api/auth/telegram:', err);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
