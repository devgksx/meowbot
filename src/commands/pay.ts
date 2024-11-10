import { Command } from "..";
import { transfer } from "../economy/manage";

export const payCommand: Command = {
  command: "pay",
  desc: "Pays a user",
  usage: "pay <user> <amount>",
  permission: 1,
  exec: async (username, args) => {
    const amount = parseInt(args[1]);
    if (!amount || !args[0]) return false;

    transfer(username, args[0], amount);
  },
};
