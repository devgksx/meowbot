import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma.player.create({
  data: {
    uuid: "1234",
    meows: 0,
    permission: 1,
  },
});

export default prisma;
