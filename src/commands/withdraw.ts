import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import { withdraw } from "../economy/manage";

export const withdrawCommand: Command = {
  command: "withdraw",
  aliases: ["wd"],
  desc: "Withdraws money from bank",
  usage: "withdraw <amount>",
  permission: 1,
  exec: async (username, args) => {
    const amount = parseInt(args[0]);
    if (!amount) {
      bot.chat(`/w ${username} ${withdrawCommand.usage}`);
      return false;
    }

    const success = await withdraw(await getUUID(username), amount);

    if (!success) {
      bot.chat(
        `/w ${username} You don't have enough money in your bank to withdraw that much`,
      );
      return false;
    }

    bot.chat(`/w ${username} You have withdrawn $${amount} from your bank`);

    return true;
  },
};
