import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import { deposit } from "../economy/manage";

export const depositCommand: Command = {
  command: "deposit",
  aliases: ["dep"],
  desc: "Deposits money into bank",
  usage: "deposit <amount>",
  permission: 1,
  exec: async (username, args) => {
    const amount = parseInt(args[0]);
    if (!amount) {
      bot.chat(`/w ${username} ${depositCommand.usage}`);

      return false;
    }

    const success = await deposit(await getUUID(username), amount);

    if (!success) {
      bot.chat(
        `/w ${username} You don't have enough money to deposit that much`,
      );

      return false;
    }

    bot.chat(`/w ${username} You have deposited $${amount} into your bank`);

    return true;
  },
};
