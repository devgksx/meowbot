import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const updatePlayer = async (uuid: string, data: any) => {
  await prisma.player.upsert({
    where: { uuid },
    update: {
      balance: data.balance || undefined,
      bank: data.bank || undefined,
      meows: data.meows || undefined,
      permission: data.permission || undefined,
    },
    create: {
      uuid,
      balance: 0,
      bank: 1000,
      meows: 0,
      permission: 1,
      cooldown: 0,
    },
  });
};

export const getPlayer = async (uuid: string) => {
  return await prisma.player.upsert({
    where: { uuid },
    update: {},
    create: {
      uuid,
      balance: 0,
      bank: 1000,
      meows: 0,
      permission: 1,
      cooldown: 0,
    },
  });
};

export default prisma;
