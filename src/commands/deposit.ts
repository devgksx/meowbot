import { Command } from "..";
import { getUUID } from "../db/manage";
import { deposit } from "../economy/manage";

export const depositCommand: Command = {
  command: "deposit",
  desc: "Deposits money into bank",
  usage: "deposit <amount>",
  permission: 1,
  exec: async (username, args) => {
    const amount = parseInt(args[0]);
    if (!amount) return false;

    deposit(await getUUID(username), amount);
  },
};
