import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import prisma from "../db/prisma";

export const meowsCommand: Command = {
  command: "meows",
  desc: "How many times you've said meow",
  usage: "meows <player?>",
  permission: 1,
  exec: async (username, args) => {
    const uuid = await getUUID(args[0] || username);

    let player = await prisma.player.upsert({
      where: {
        uuid: uuid,
      },
      update: {},
      create: {
        meows: 0,
        uuid: uuid,
        permission: 1,
      },
    });

    bot.chat(
      `/w ${username} ${args[0] || username} said it ${player.meows || 0} times!`,
    );
    return true;
  },
};
