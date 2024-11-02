import { bot, Command, data } from "..";
import { getUUID } from "../db/manage";

export const getPermissionsCommand : Command = {
  command : "getpermissions",
  usage : "getpermissions <player?>",
  permission : 10,
  desc : "Gets the permission level of a player",
  exec : async (username, args) => {
    const player = args[0] || username;
    bot.chat(`/w ${username} Player ${player} has the permission level ${data.permissions[await getUUID(player)] || 1}`);
    return true;
  } 
}
