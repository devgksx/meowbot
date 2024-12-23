import { bot, Command, commands } from "..";
import { getUUID } from "../db/manage";
import { getPlayer } from "../db/prisma";

export const helpCommand: Command = {
  command: "help",
  desc: "lists all commands",
  usage: "help <command?>",
  permission: 1,
  exec: async (username, args) => {
    const uuid = await getUUID(username);

    const player = await getPlayer(uuid);

    const playerPermissionLevel = player.permission || 1;
    if (args[0]) {
      commands.forEach((cmd) => {
        if (args[0] == cmd.command && playerPermissionLevel >= cmd.permission) {
          bot.chat(`/w ${username} ${cmd.usage} | ${cmd.desc}`);
          return true;
        }
      });
      return true;
    }

    let message = "";

    commands.forEach((cmd) => {
      if (playerPermissionLevel >= cmd.permission) message += cmd.command + " ";
    });

    bot.chat(`/w ${username} ${message}`);

    return true;
  },
};
