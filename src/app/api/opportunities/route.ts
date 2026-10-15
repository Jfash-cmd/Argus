import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrize = searchParams.get('minPrize');
    const sort = searchParams.get('sort') || 'newest';
    const urgentOnly = searchParams.get('urgentOnly') === 'true';

    const where: Prisma.OpportunityWhereInput = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    if (minPrize && !isNaN(Number(minPrize))) {
      where.reward_num = { gte: Number(minPrize) };
    }

    if (urgentOnly) {
      const now = new Date();
      const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);
      where.deadline = {
        gte: now,
        lte: in48h,
      };
    }

    let orderBy: Prisma.OpportunityOrderByWithRelationInput[] = [{ first_seen: 'desc' }];
    if (sort === 'reward') {
      orderBy = [{ reward_num: 'desc' }, { first_seen: 'desc' }];
    } else if (sort === 'closing_soon') {
      orderBy = [{ deadline: 'asc' }, { first_seen: 'desc' }];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy,
      take: 100,
    });

    const parsed = opportunities.map(o => ({
      ...o,
      tags: JSON.parse(o.tags || '[]'),
    }));

    return NextResponse.json({
      opportunities: parsed,
      total: parsed.length,
    });
  } catch (err: any) {
    console.error('API Error /api/opportunities:', err);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}
