import { bot, Command } from "..";

export const chatCommand : Command = {
  command : "chat",
  desc : "chat",
  usage : "chat <message>",
  permission : 1,
  exec : async (_, args) => {
    bot.chat(args.join(" "));
    return true;
  }
}
