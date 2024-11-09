import { bot, Command } from "..";

export const healthCommand: Command = {
  command: "health",
  desc: "Check your health",
  usage: "health",
  permission: 1,
  exec: async (username) => {
    bot.chat(
      `/w ${username} My health is ${bot.health} and my hunger is ${bot.foodSaturation}`,
    );
    return true;
  },
};
