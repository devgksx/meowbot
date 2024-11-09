import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import prisma from "../db/prisma";

export const setPermissionCommand: Command = {
  desc: "Sets the permission of a user",
  permission: 10,
  usage: "setpermission <username>",
  command: "setpermission",
  exec: async (username, args) => {
    const uuid = await getUUID(args[0]);

    prisma.player
      .upsert({
        where: {
          uuid: uuid,
        },
        update: {
          permission: parseInt(args[1]),
        },
        create: {
          meows: 0,
          uuid: uuid,
          permission: parseInt(args[1]),
        },
      })
      .catch((e) => {
        console.error(e);
        return false;
      });

    bot.chat(
      `/w ${username} Permission level for player ${args[0]} set to ${args[1]}`,
    );

    return true;
  },
};
