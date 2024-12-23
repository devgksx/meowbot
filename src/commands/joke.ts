import { Command, bot } from "..";

export const jokeCommand: Command = {
  command: "joke",
  permission: 1,
  usage: "joke",
  desc: "Get a random joke",
  exec: async (username, _) => {
    const url = "https://official-joke-api.appspot.com/jokes/random";
    const data = await (await fetch(url)).json();

    if (!data.setup || !data.punchline) {
      bot.chat(`/w ${username} Something went wrong, please try again later`);
      return false;
    }

    bot.chat(`/w ${username} ${data.setup} ${data.punchline}`);

    return true;
  },
};
