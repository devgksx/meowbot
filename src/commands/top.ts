import { bot, Command, data } from "..";

export const topCommand : Command = {
  command: "top",
  desc: "Top players for a specific category.",
  usage: "top <meows>",
  permission : 1,
  exec: async (username: string, args: string) => {
    let array = [];

    if (args == "meows") {
      for (const a in data.meowCounter) {
        array.push([a, data.meowCounter[a]]);
      }
      array.sort(function (a, b) { return b[1] - a[1] });
      array = array.slice(0, 10);
      const formattedString = array
        .map(item => `${item[0]}: ${item[1]}`)
        .join(', ');                         

      bot.chat(`/w ${username} Top 10 meowers: ${formattedString}`);
    }

    else {
      bot.chat(`/w ${username} ${topCommand.usage}`);
    }
  }
};

