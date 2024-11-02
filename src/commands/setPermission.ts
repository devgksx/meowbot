import { bot, Command, data } from "..";
import { getUUID } from "../db/manage";

export const setPermissionCommand : Command = {
  desc : "Sets the permission of a user",
  permission : 10,
  usage : "setpermission <username>",
  command : "setpermission",
  exec: async (username, args) => {

    data.permissions[await getUUID(args[0])] = args[1];
    bot.chat(`/w ${username} Permission level for player ${args[0]} set to ${args[1]}`)

    return true;
  }
}
