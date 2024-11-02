import { bot, Command, data } from "..";
import { getUUID } from "../db/manage";

export const meowsCommand : Command = {
  command : "meows",
  desc : "How many times you've said meow",
  usage : "meows <player?>",
  permission : 1,
  exec : async (username, args) => {
    bot.chat(`/w ${username} ${args[0] || username} said it ${data.meowCounter[await getUUID(args[0] || username)]} times!`);
    return true;
  }
};
