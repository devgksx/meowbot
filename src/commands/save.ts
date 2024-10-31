import { save } from "../db/manage.js";

export const saveCommand = {
  command : "save",
  desc : "saves the db",
  usage : "save",
  permission : 10,
  exec : async () => {

    save();
    return;

  }
}
