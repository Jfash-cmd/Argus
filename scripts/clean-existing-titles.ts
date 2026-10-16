import { prisma } from '../src/lib/db';
import { cleanTitle } from '../src/types/opportunity';

async function main() {
  console.log('=== Cleaning all opportunity titles in database ===');
  const allOpps = await prisma.opportunity.findMany({
    select: { id: true, title: true, source: true, details: true },
  });

  console.log(`Inspecting ${allOpps.length} opportunities...`);
  let updatedCount = 0;

  for (const opp of allOpps) {
    const { title: newTitle, details: newDetails } = cleanTitle(opp.title);
    const finalDetails = opp.details || newDetails;

    if (newTitle !== opp.title || (newDetails && !opp.details)) {
      console.log(`[${opp.source}] Title cleaned:`);
      console.log(`   Old: "${opp.title}"`);
      console.log(`   New: "${newTitle}"`);
      if (finalDetails !== opp.details) {
        console.log(`   Details: "${finalDetails}"`);
      }

      await prisma.opportunity.update({
        where: { id: opp.id },
        data: {
          title: newTitle,
          details: finalDetails,
        },
      });
      updatedCount++;
    }
  }

  console.log(`=== Title cleanup complete. Updated ${updatedCount} of ${allOpps.length} records. ===`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
