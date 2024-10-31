import { bot, Command, commands, data } from "..";

export const helpCommand : Command = {
  command : "help",
  desc : "lists all commands",
  usage : "help <command?>",
  permission : 1,
  exec : async (username: string, args: string) => {
    
    if (args != undefined) {
      commands.forEach(cmd => {
        if (args == cmd.command && (data.permissions[username] || 1) >= cmd.permission) {
          bot.chat(`/w ${username} ${cmd.usage} | ${cmd.desc}`);
          return;
        }
      });
      return;
    }

    let message = "";

    commands.forEach(cmd => {
      if ((data.permissions[username] || 1) >= cmd.permission)
        message += cmd.command + " "; 
    });

    bot.chat(`/w ${username} ${message}`);

  }
}
