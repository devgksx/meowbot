import { bot, Command, data } from "..";
import { getUUID } from "../db/manage";
import prisma from "../db/prisma";

export const setPermissionCommand: Command = {
  desc: "Sets the permission of a user",
  permission: 10,
  usage: "setpermission <username>",
  command: "setpermission",
  exec: async (username, args) => {
    const uuid = await getUUID(args[0]);
    const player = await prisma.player.findFirst({
      where: {
        uuid: uuid,
      },
    });

    prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        permission: parseInt(args[1]),
      },
    });

    bot.chat(
      `/w ${username} Permission level for player ${args[0]} set to ${args[1]}`,
    );

    return true;
  },
};
