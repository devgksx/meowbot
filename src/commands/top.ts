import { bot, Command } from "..";
import { getUsernameFromUUID } from "../db/manage";
import prisma from "../db/prisma";

export const topCommand: Command = {
  command: "top",
  desc: "Top players for a specific category.",
  usage: "top <meows>",
  permission: 1,
  exec: async (username, args) => {
    let array = [];

    const players = await prisma.player.findMany();

    if (args[0] == "meows") {
      for (const a in players) {
        array.push([
          await getUsernameFromUUID(players[a].uuid),
          players[a].meows,
        ]);
      }
      array.sort(function (a, b) {
        return b[1] - a[1];
      });
      array = array.slice(0, 10);
      const formattedString = array
        .map((item) => `${item[0]}: ${item[1]}`)
        .join(", ");

      bot.chat(`/w ${username} Top 10 meowers: ${formattedString}`);
    } else {
      bot.chat(`/w ${username} ${topCommand.usage}`);
    }

    return true;
  },
};
