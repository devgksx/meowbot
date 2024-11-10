import prisma, { updatePlayer } from "../db/prisma";

export const setBalance = async (uuid: string, balance: number) => {
  updatePlayer(uuid, { balance: balance });
};

export const transfer = async (
  from: string,
  to: string,
  amount: number,
): Promise<boolean> => {
  const fromPlayer = await prisma.player.findUnique({
    where: { uuid: from },
  });

  if (!fromPlayer || fromPlayer.balance < amount) return false;

  await prisma.$transaction([
    prisma.player.update({
      where: { uuid: from },
      data: { balance: { decrement: amount } },
    }),
    prisma.player.upsert({
      where: { uuid: to },
      create: {
        uuid: to,
        balance: amount,
        bank: 0,
        meows: 0,
        permission: 1,
      },
      update: { balance: { increment: amount } },
    }),
  ]);

  return true;
};

export const withdraw = async (
  uuid: string,
  amount: number,
): Promise<boolean> => {
  const player = await prisma.player.findUnique({
    where: { uuid },
  });

  if (player.bank < amount) return false;

  updatePlayer(uuid, {
    balance: { increment: amount },
    bank: { decrement: amount },
  });

  return true;
};

export const getBalance = async (uuid: string) => {
  const player = await prisma.player.findUnique({
    where: { uuid },
  });

  return player?.balance;
};

export const getBank = async (uuid: string) => {
  const player = await prisma.player.findUnique({
    where: { uuid },
  });

  return player?.bank;
};

export const setBank = async (uuid: string, bank: number) => {
  updatePlayer(uuid, { bank });
};

export const deposit = async (
  uuid: string,
  amount: number,
): Promise<boolean> => {
  const player = await prisma.player.findUnique({
    where: { uuid },
  });

  if (player.balance < amount) return false;

  updatePlayer(uuid, {
    balance: { decrement: amount },
    bank: { increment: amount },
  });

  return true;
};

export const addBalance = async (uuid: string, amount: number) => {
  updatePlayer(uuid, { balance: { increment: amount } });
};

export const subtractBalance = async (uuid: string, amount: number) => {
  updatePlayer(uuid, { balance: { decrement: amount } });
};
