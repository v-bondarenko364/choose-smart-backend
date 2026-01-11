import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

class Prisma {
  private static instance: PrismaClient;

  public static get connection(): PrismaClient {
    if (!Prisma.instance) {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      });
      Prisma.instance = new PrismaClient({ adapter });
    }
    return Prisma.instance;
  }
}

export default Prisma;
