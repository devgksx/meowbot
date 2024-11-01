import { bot, Command } from "..";


export const sourceCommand : Command = {
  command : "source",
  desc : "source code of the bot",
  usage : "source",
  permission : 1,
  exec : async (username: string) => {
    
    bot.chat(`/w ${username} https://github.com/devgksx/meowbot/`);

    return true;
  }
}
