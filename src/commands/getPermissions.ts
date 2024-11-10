import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import { getPlayer } from "../db/prisma";

export const getPermissionsCommand: Command = {
  command: "getpermissions",
  usage: "getpermissions <player?>",
  permission: 10,
  desc: "Gets the permission level of a player",
  exec: async (username, args) => {
    const uuid = await getUUID(args[0] || username);

    const player = await getPlayer(uuid);

    bot.chat(
      `/w ${username} Player ${args[0] || username} has the permission level ${player.permission || 1}`,
    );
    return true;
  },
};
