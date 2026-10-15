import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function runVerification() {
  console.log('--- ARGUS DATABASE VERIFICATION ---');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));
  
  console.log('\n[1/5] Connecting to PostgreSQL database...');
  await prisma.$connect();
  console.log('✓ Connected successfully to Supabase PostgreSQL.');

  console.log('\n[2/5] Querying existing table counts...');
  const oppCount = await prisma.opportunity.count();
  const userCount = await prisma.user.count();
  const filterCount = await prisma.filter.count();
  console.log(`✓ Table opportunities count: ${oppCount}`);
  console.log(`✓ Table users count:         ${userCount}`);
  console.log(`✓ Table filters count:       ${filterCount}`);

  console.log('\n[3/5] Writing a test record to "opportunities"...');
  const testId = `test-${Date.now()}`;
  const testOpp = await prisma.opportunity.create({
    data: {
      title: `DB Verification Test Opportunity ${Date.now()}`,
      source: 'verification_test',
      category: 'bounty',
      reward: '$500',
      reward_num: 500,
      link: 'https://example.com/test',
      tags: JSON.stringify(['test', 'verification']),
    },
  });
  console.log(`✓ Write successful! Created test record ID: ${testOpp.id}`);

  console.log('\n[4/5] Reading the test record back from PostgreSQL...');
  const readBack = await prisma.opportunity.findUnique({
    where: { id: testOpp.id },
  });
  if (!readBack || readBack.title !== testOpp.title) {
    throw new Error('Read verification failed: record not found or mismatched!');
  }
  console.log(`✓ Read successful! Title verified: "${readBack.title}" (Reward: ${readBack.reward})`);

  console.log('\n[5/5] Cleaning up test record...');
  await prisma.opportunity.delete({
    where: { id: testOpp.id },
  });
  console.log('✓ Cleanup successful! Test record deleted.');

  const finalOppCount = await prisma.opportunity.count();
  console.log(`\n========================================`);
  console.log(`✓ ALL VERIFICATION CHECKS PASSED`);
  console.log(`Total live opportunities ready in PostgreSQL: ${finalOppCount}`);
  console.log(`========================================\n`);
}

runVerification()
  .catch((err) => {
    console.error('\n❌ VERIFICATION FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
