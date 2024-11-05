import { bot, Command } from "..";

export const discordCommand : Command = {
  command: "discord",
  desc: "Discord server link",
  usage: "discord",
  permission: 1,
  exec: async (username) => {

    bot.chat(`/w ${username} Discord server: https://discord.gg/ZDFWDubzRG`);
    
    return true;
  }
}
