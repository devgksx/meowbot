import { bot, Command } from "..";

export const geolocCommand: Command = {
  command: "geoloc",
  permission: 1,
  usage: "geoloc <ip> [ use commas instead of periods ]",
  desc: "Get approximate location of an IP",
  exec: async (username, args) => {
    const ip = args[0];

    if (!ip) {
      bot.chat(`/w ${username} Usage: ${geolocCommand.usage}`);
      console.log(args);
      return false;
    }

    const url = `http://ip-api.com/json/${ip.replace(/,/g, ".")}`;
    const data = await (await fetch(url)).json();

    bot.chat(
      `/w ${username} Approximate location: ${data.city}, ${data.regionName}, ${data.country}`,
    );

    return true;
  },
};
