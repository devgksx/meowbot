import { bot, Command, data } from "..";
import { getUUID } from "../db/manage";

export const meowsCommand : Command = {
  command : "meows",
  desc : "How many times you've said meow",
  usage : "meows <player?>",
  permission : 1,
  exec : async (username: string, args: string) => {
    bot.chat(`/w ${username} ${args || username} said it ${data.meowCounter[await getUUID(args || username)]} times!`);
    return true;
  }
};
