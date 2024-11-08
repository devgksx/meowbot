import { bot, Command } from "..";

export const killCommand : Command = {
  command : "kill",
  permission : 1,
  usage : "kill",
  desc : "Run /kill",
  exec : async (_, __) => {
    
    bot.chat("/kill");

    return true;
  }
}
