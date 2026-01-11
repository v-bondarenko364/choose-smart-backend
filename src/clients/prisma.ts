import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

class Prisma {
  private static instance: PrismaClient;
  private static pool: Pool;

  public static get connection(): PrismaClient {
    if (!Prisma.instance) {
      // Create a Pool with SSL configuration for Digital Ocean
      if (!Prisma.pool) {
        Prisma.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false, // Required for Digital Ocean managed databases
          },
          max: 22, // Connection pool size
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
      }

      const adapter = new PrismaPg(Prisma.pool);
      Prisma.instance = new PrismaClient({ adapter });
    }
    return Prisma.instance;
  }
}

export default Prisma;
