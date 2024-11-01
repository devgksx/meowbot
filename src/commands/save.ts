import { save } from "../db/manage";
import { Command } from "../index";

export const saveCommand : Command = {
  command : "save",
  desc : "saves the db",
  usage : "save",
  permission : 10,
  exec : async () => {

    save();
    return true;

  }
}
