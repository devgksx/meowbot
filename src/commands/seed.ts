import { bot, Command } from "..";

export const seedCommand: Command = {
  command: "seed",
  usage: "seed",
  permission: 1,
  desc: "World seed",
  exec: async (username) => {
    bot.chat(
      `/w ${username} 7540332306713543803 or copy it here https://pastebin.com/raw/rBPFKiNA`,
    );
    return true;
  },
};
