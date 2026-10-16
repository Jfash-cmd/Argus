import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getCompetitiveness } from '@/types/opportunity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrize = searchParams.get('minPrize');
    const sort = searchParams.get('sort') || 'newest';
    const urgentOnly = searchParams.get('urgentOnly') === 'true';

    const where: Prisma.OpportunityWhereInput = {};
    const now = new Date();
    const andConditions: Prisma.OpportunityWhereInput[] = [];

    if (category && category !== 'all') {
      const normCat = category.toLowerCase().trim().replace(/[\s-]+/g, '_');
      if (normCat === 'hackathon') {
        where.category = { in: ['web3_hackathon', 'web2_hackathon', 'hackathon'] };
      } else {
        where.category = { in: [normCat, category, category.toLowerCase()] };
      }
    }

    // Filter out expired opportunities entirely (only future deadline or null)
    if (urgentOnly) {
      const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      andConditions.push({
        deadline: {
          gte: now,
          lte: in48h,
        },
      });
    } else {
      andConditions.push({
        OR: [
          { deadline: null },
          { deadline: { gt: now } },
        ],
      });
    }

    if (search && search.trim()) {
      const q = search.trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { tags: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    if (minPrize && !isNaN(Number(minPrize))) {
      where.reward_num = { gte: Number(minPrize) };
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
      competitiveness: o.competitiveness || getCompetitiveness(o.source),
      tags: JSON.parse(o.tags || '[]'),
    }));

    // Prioritize and surface "low competitiveness" opportunities higher/first within their category
    parsed.sort((a, b) => {
      const isLowA = a.competitiveness === 'low' ? 0 : 1;
      const isLowB = b.competitiveness === 'low' ? 0 : 1;
      return isLowA - isLowB;
    });

    return NextResponse.json({
      opportunities: parsed,
      total: parsed.length,
    });
  } catch (err: any) {
    console.error('API Error /api/opportunities:', err);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}
