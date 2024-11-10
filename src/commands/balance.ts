import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import { getBalance } from "../economy/manage";

export const balanceCommand: Command = {
  command: "balance",
  desc: "Shows your balance.",
  usage: "balance",
  aliases: ["bal"],
  permission: 1,
  exec: async (username, args) => {
    bot.chat(
      `/w ${username} Your balance is: ${await getBalance(
        await getUUID(args[0] || username),
      )}`,
    );

    return true;
  },
};
