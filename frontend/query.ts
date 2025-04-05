import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const data = {
    users: await prisma.user.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
    verificationTokens: await prisma.verificationToken.findMany()
  }
  
  console.log('Database Contents:')
  console.log(JSON.stringify(data, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 