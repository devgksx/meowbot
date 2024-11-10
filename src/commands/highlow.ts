import { bot, Command } from "..";
import { getUUID } from "../db/manage";
import { addBalance, getBalance, subtractBalance } from "../economy/manage";

export const highlowCommand: Command = {
  command: "highlow",
  aliases: ["hl"],
  desc: "Gamble your money in a highlow game. Must be over $1 bet",
  usage: "highlow <bet> <high|low>",
  permission: 1,
  exec: async (username, args) => {
    const bet = parseInt(args[0]);
    const choice = args[1];

    const uuid = await getUUID(username);

    if (!bet || !choice || bet < 1 || (choice !== "high" && choice !== "low")) {
      bot.chat(`/w ${username} ${highlowCommand.usage}`);
      return false;
    }

    const balance = await getBalance(uuid);

    if (balance < bet) {
      bot.chat(`/w ${username} You don't have enough money to bet that much`);
      return false;
    }

    const roll = Math.floor(Math.random() * 100) + 1;
    const isHigh = roll > 50;
    const isLow = !isHigh;

    const playerWon =
      (choice == "high" && isHigh) || (choice == "low" && isLow);
    const resultMessage = playerWon
      ? `/w ${username} You won $${bet}! The roll was ${roll}`
      : `/w ${username} You lost $${bet}! The roll was ${roll}`;

    bot.chat(resultMessage);

    if (playerWon) addBalance(uuid, bet);
    else subtractBalance(uuid, bet);

    return true;
  },
};
