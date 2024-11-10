import { Command } from "..";
import { getUUID } from "../db/manage";
import { withdraw } from "../economy/manage";

export const withdrawCommand: Command = {
  command: "withdraw",
  desc: "Withdraws money from bank",
  usage: "withdraw <amount>",
  permission: 1,
  exec: async (username, args) => {
    const amount = parseInt(args[0]);
    if (!amount) return false;

    withdraw(await getUUID(username), amount);
  },
};
