import { bot, Command } from "..";

export const geolocCommand: Command = {
  command: "geoloc",
  permission: 1,
  usage: "geoloc",
  desc: "Get your current geolocation",
  exec: async (username, args) => {
    const ip = args[0];
    const url = `http://ip-api.com/json/${ip}`;
    const data = await (await fetch(url)).json();

    bot.chat(
      `/w ${username} Approximate location: ${data.city}, ${data.regionName}, ${data.country}`,
    );

    return true;
  },
};
