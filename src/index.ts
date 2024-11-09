import { Bot, createBot } from "mineflayer";

import fs from "fs";
import path from "path";

import { getUUID } from "./db/manage";
import { sendWebhookMessage } from "./discord/manage";
import prisma from "./db/prisma";

if (!fs.existsSync("./config.json")) {
  fs.writeFileSync(
    "./config.json",
    JSON.stringify(
      {
        PREFIX: "$",
        WEBHOOK_URL: "",
        DISCORD_ENABLED: false,
        SERVER: "constantiam.net",
      },
      null,
      2,
    ),
  );
}

export const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

const prefix = config["PREFIX"];
const server = config["SERVER"];

export const webhook_url = config["WEBHOOK_URL"];
export const discord_enabled = config["DISCORD_ENABLED"];

export let bot: Bot;

export interface Command {
  command: string;
  desc: string;
  usage: string;
  permission: number;
  exec(username: string, args: string[]): Promise<boolean>;
}

const sanitizeMessage = (msg: string) => msg.replace(/[^\x00-\x7F]/g, "");

const rotateMessage = async () => {
  data.currentSpam + 1 > data.spamMessages.length - 1
    ? (data.currentSpam = 1)
    : data.currentSpam++;
};

export let data = {
  spamMessages: ["meow 🐈", "meow~ ❤️", "mrreow!!!"],
  currentSpam: 0,
};

export const updateData = (newData: any) => {
  data = newData;
};

export let commands: Command[] = [];

export const loadCommands = async (): Promise<Command[]> => {
  const commandsDir = path.join(__dirname, "commands");
  const commands: Command[] = [];

  return new Promise((resolve, reject) => {
    fs.readdir(commandsDir, async (err, files) => {
      if (err) {
        console.error("Error reading commands directory:", err);
        return reject(err);
      }

      for (const file of files) {
        if (file.endsWith(".ts") || file.endsWith(".js")) {
          const commandPath = path.join(commandsDir, file);

          try {
            const commandModule = await import(commandPath);
            const commandName = path.basename(file, path.extname(file));

            const command = commandModule[
              (commandName.match(/^\d/) ? `_${commandName}` : commandName) +
                "Command"
            ] as Command;

            if (command && command.command && command.exec) {
              commands.push(command);
              console.log(`Registered command ${command.command}`);
            } else {
              console.warn(`Invalid command in file ${file}:`, command);
            }
          } catch (error) {
            console.error(`Error loading command from ${file}:`, error);
          }
        }
      }

      resolve(commands);
    });
  });
};

const registerBot = async () => {
  bot = createBot({
    host: server,
    port: 25565,
    username: process.env.USERNAME,
    auth: "microsoft",
  });

  commands = await loadCommands();

  let chatCounter = 0;

  bot.on("error", (err) => console.error(err));
  bot.on("end", (reason) => {
    console.error(reason);
    setTimeout(() => registerBot(), 5000);
  });

  bot.on("whisper", async (usr: string, msg: string) => {
    const [playerCommand, ...playerCommandArgs] = msg.split(" ");
    const uuid = await getUUID(usr);
    const player = await prisma.player.findFirst({
      where: {
        uuid: uuid,
      },
    });

    if (!player) {
      await prisma.player.create({
        data: {
          meows: 0,
          uuid: uuid,
          permission: 1,
        },
      });
    }

    console.log(playerCommand);

    console.log(`WHISPER <${usr}> ${msg}`);

    if (!playerCommand) return;

    commands.forEach((cmd) => {
      if (
        playerCommand.toLowerCase() == cmd.command.toLowerCase() &&
        (player.permission || 1) >= cmd.permission
      ) {
        cmd.exec(usr, playerCommandArgs).then((succeeded) => {
          if (succeeded) return;
          console.error(`${usr} executed ${cmd.command} and an error occured`);
        });
      }
    });
  });

  bot.on("message", async (message) => {
    const usr: string = message.json["extra"]?.[0]?.extra?.[1]?.text;
    let msg: string = message.json["extra"]?.[2]?.text.slice(1);

    if (!usr || !msg) return;

    const uuid = await getUUID(usr);
    const player = await prisma.player.findFirst({
      where: {
        uuid: uuid,
      },
    });

    if (!player) {
      await prisma.player.create({
        data: {
          meows: 0,
          uuid: uuid,
          permission: 1,
        },
      });
    }

    sendWebhookMessage(
      usr,
      uuid,
      `${msg}`,
      msg.startsWith(">") ? { color: 0x00ff00 } : undefined,
    );

    bot.swingArm("right");

    msg = sanitizeMessage(msg);

    console.log(`<${usr}> ${msg}`);

    if (
      usr == "loc_" ||
      msg.toLowerCase().includes(data.spamMessages[data.currentSpam])
    )
      return;

    if (msg.toLowerCase().includes("top 10 meowers:")) return;

    if (++chatCounter >= 50) {
      bot.chat(data.spamMessages[data.currentSpam]);
      if (chatCounter >= 100) rotateMessage();
      chatCounter = 0;
    }

    if (
      (msg.toLowerCase().includes("meow") ||
        msg.toLowerCase().includes("mreow")) &&
      !msg.includes("$")
    ) {
      await prisma.player.update({
        where: {
          id: player.id,
        },
        data: {
          meows: player.meows + 1,
        },
      });
    }

    if (!msg.startsWith(prefix)) return;

    const [playerCommand, ...playerCommandArgs] = msg.slice(1).split(" ");

    if (!playerCommand) return;

    commands.forEach((cmd) => {
      if (
        playerCommand.toLowerCase() == cmd.command.toLowerCase() &&
        (player.permission || 1) >= cmd.permission
      ) {
        cmd.exec(usr, playerCommandArgs).then((succeeded) => {
          if (succeeded) return;
          console.error(`${usr} executed ${cmd.command} and an error occured`);
        });
      }
    });
  });
};

registerBot();
