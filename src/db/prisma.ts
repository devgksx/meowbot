import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updatePlayer = async (uuid: string, data: any) => {
  await prisma.player.upsert({
    where: { uuid },
    update: {
      ...data,
    },
    create: {
      uuid,
      balance: 0,
      bank: 1000,
      meows: 0,
      permission: 1,
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
    },
  });
};

export default prisma;
