import { prisma } from '../src/lib/db';

async function main() {
  const now = new Date();
  const expired = await prisma.opportunity.findMany({
    where: { deadline: { lt: now } },
    select: { id: true, title: true, source: true, deadline: true },
  });
  const total = await prisma.opportunity.count();
  console.log(`Total in DB: ${total}`);
  console.log(`Expired in DB: ${expired.length}`);
  for (const e of expired) {
    console.log(`  [${e.source}] "${e.title}" | Deadline: ${e.deadline?.toISOString()}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
