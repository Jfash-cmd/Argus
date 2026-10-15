import { prisma } from '../lib/db';
import { cleanRewardString, parseRewardAmount } from '../types/opportunity';

async function main() {
  const opps = await prisma.opportunity.findMany();
  let count = 0;
  for (const o of opps) {
    const cleaned = cleanRewardString(o.reward);
    const parsedNum = o.reward_num ?? parseRewardAmount(cleaned);
    if (cleaned !== o.reward || o.reward_num !== parsedNum) {
      await prisma.opportunity.update({
        where: { id: o.id },
        data: {
          reward: cleaned,
          reward_num: parsedNum,
        },
      });
      count++;
    }
  }
  console.log(`Successfully cleaned ${count} existing opportunities in database.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
