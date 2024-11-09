import { bot, Command } from "..";

export const chatCommand: Command = {
  command: "chat",
  desc: "chat",
  usage: "chat <message>",
  permission: 1,
  exec: async (_, args) => {
    const msg = args.join(" ");
    if (!msg.startsWith("/")) bot.chat(msg);
    return true;
  },
};
