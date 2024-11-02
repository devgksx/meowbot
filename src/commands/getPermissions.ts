import { bot, Command, data } from "..";
import { getUUID } from "../db/manage";

export const getPermissionsCommand : Command = {
  command : "getpermissions",
  usage : "getpermissions <player?>",
  permission : 10,
  desc : "Gets the permission level of a player",
  exec : async (username, args) => {
    if (!args[0]) {
      bot.chat(`/w ${username} ${getPermissionsCommand.usage}`);
      return false;
    }
    bot.chat(`/w ${username} Player ${args[0]} has the permission level ${data.permissions[await getUUID(args[0])]}`);
    return true;
  } 
}
