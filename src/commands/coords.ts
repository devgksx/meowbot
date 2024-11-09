import { bot, Command } from "..";

export const coordsCommand: Command = {
  command: "coords",
  permission: 1,
  usage: "coords",
  desc: "Get your current coordinates",
  exec: async (username, _) => {
    const pos = bot.entity.position;

    bot.chat(`/w ${username} My coords are ${pos.x} ${pos.y} ${pos.z}`);

    return true;
  },
};
