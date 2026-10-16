import { prisma } from '../src/lib/db';
import { classifyHackathon } from '../src/lib/categorization';

async function main() {
  console.log('--- Migrating database records ---');

  // 1. Check sources
  const substackMediumCount = await prisma.opportunity.count({
    where: { source: 'substack_medium' },
  });
  console.log(`Found ${substackMediumCount} records with source = 'substack_medium'`);

  if (substackMediumCount > 0) {
    const opps = await prisma.opportunity.findMany({
      where: { source: 'substack_medium' },
    });
    for (const opp of opps) {
      const newSource = opp.link.includes('substack.com') ? 'substack' : 'medium';
      await prisma.opportunity.update({
        where: { id: opp.id },
        data: { source: newSource },
      });
      console.log(`Updated opportunity "${opp.title}" source: substack_medium -> ${newSource}`);
    }
  }

  // 2. Check categories with 'hackathon'
  const hackathons = await prisma.opportunity.findMany({
    where: { category: 'hackathon' },
  });
  console.log(`Found ${hackathons.length} records with category = 'hackathon'`);

  let web3Count = 0;
  let web2Count = 0;

  for (const opp of hackathons) {
    const tags: string[] = JSON.parse(opp.tags || '[]');
    const newCategory = classifyHackathon(opp.source, opp.title, tags, opp.details);
    await prisma.opportunity.update({
      where: { id: opp.id },
      data: { category: newCategory },
    });
    if (newCategory === 'web3_hackathon') web3Count++;
    else web2Count++;
    console.log(`[Reclassified] "${opp.title}" (${opp.source}) -> ${newCategory}`);
  }

  console.log(`Reclassified ${hackathons.length} hackathons: ${web3Count} Web3, ${web2Count} Web2.`);

  // 3. Current category breakdown in DB
  const allOpps = await prisma.opportunity.findMany({
    select: { category: true, source: true },
  });
  const catBreakdown: Record<string, number> = {};
  const srcBreakdown: Record<string, number> = {};
  for (const o of allOpps) {
    catBreakdown[o.category] = (catBreakdown[o.category] || 0) + 1;
    srcBreakdown[o.source] = (srcBreakdown[o.source] || 0) + 1;
  }
  console.log('Category breakdown:', catBreakdown);
  console.log('Source breakdown:', srcBreakdown);
  console.log('--- Migration complete ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
