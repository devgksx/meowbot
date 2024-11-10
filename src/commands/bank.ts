import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import { getBank } from "../economy/manage";

export const bankCommand: Command = {
  command: "bank",
  desc: "Shows your bank balance.",
  usage: "bank",
  permission: 1,
  exec: async (username, args) => {
    bot.chat(
      `/w ${username} ${args[0] || username} bank balance is: ${await getBank(
        await getUUID(args[0] || username),
      )}`,
    );

    return true;
  },
};
