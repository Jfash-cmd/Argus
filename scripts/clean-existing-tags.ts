import { prisma } from '../src/lib/db';
import { isRedundantTag, filterAndCleanTags } from '../src/types/opportunity';

async function main() {
  console.log('--- Inspecting and Cleaning Existing Database Tags ---');

  const allOpps = await prisma.opportunity.findMany({
    select: { id: true, title: true, source: true, tags: true },
  });

  console.log(`Total opportunities in DB: ${allOpps.length}`);

  let updatedCount = 0;

  for (const opp of allOpps) {
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(opp.tags || '[]');
    } catch {
      parsedTags = [];
    }

    const cleaned = filterAndCleanTags(parsedTags, opp.source);

    const oldStr = JSON.stringify(parsedTags);
    const newStr = JSON.stringify(cleaned);

    if (oldStr !== newStr) {
      console.log(`[${opp.source}] "${opp.title}": ${oldStr} -> ${newStr}`);
      await prisma.opportunity.update({
        where: { id: opp.id },
        data: { tags: newStr },
      });
      updatedCount++;
    }
  }

  console.log(`--- Tag cleanup complete. Updated ${updatedCount} of ${allOpps.length} records. ---`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
