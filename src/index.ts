import { Bot, createBot } from "mineflayer";

import fs from "fs";
import path from "path";

import { getUUID } from "./db/manage";
import { sendWebhookMessage } from "./discord/manage";
import { getPlayer, updatePlayer } from "./db/prisma";
import { runAPI } from "./api/manage";

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
  aliases?: string[];
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
  spamMessages: ["meow 🐈", "meow~ ❤", "mrreow!!!"],
  currentSpam: 0,
};

export const updateData = (newData: any) => {
  data = newData;
};

export let commands: Command[] = [];

const COOLDOWN_PERIOD = 2500;
const RATE_LIMIT_DELAY = 2000;

interface CommandQueueItem {
  command: string;
  args: string[];
  usr: string;
  permission: number;
  resolve: (result: boolean) => void;
}

const commandQueue: CommandQueueItem[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || commandQueue.length === 0) return;

  isProcessingQueue = true;

  while (commandQueue.length > 0) {
    const { command, args, usr, permission, resolve } = commandQueue.shift()!;

    const result = await executeCommandInternal(command, args, usr, permission);
    resolve(result);

    await new Promise((res) => setTimeout(res, RATE_LIMIT_DELAY));
  }

  isProcessingQueue = false;
};

const executeCommandInternal = async (
  command: string,
  args: string[],
  usr: string,
  permission: number,
): Promise<boolean> => {
  try {
    const uuid = await getUUID(usr);
    const player = await getPlayer(uuid);
    const currentTime = Date.now();

    if (currentTime < player.cooldown) {
      const remainingTime = Math.ceil((player.cooldown - currentTime) / 1000);
      bot.chat(`/w ${usr} You're on cooldown! Please wait ${remainingTime} seconds.`);
      return false;
    }

    for (const cmd of commands) {
      if (
        (command.toLowerCase() === cmd.command.toLowerCase() ||
          cmd.aliases?.includes(command.toLowerCase())) &&
        permission >= cmd.permission
      ) {
        const succeeded = await cmd.exec(usr, args);

        if (succeeded) {
          await updatePlayer(uuid, { cooldown: currentTime + COOLDOWN_PERIOD });
          console.log(`Executed command ${command} with args ${args} from player ${usr} with cooldown ${currentTime + COOLDOWN_PERIOD}`);
          return true;
        } else {
          bot.chat(`/w ${usr} An error occurred while executing your command.`);
          return false;
        }
      }
    }

    bot.chat(`/w ${usr} Unknown command: ${command}`);
    return false;
  } catch (error) {
    bot.chat(`/w ${usr} An internal error occurred. Please try again later.`);
    return false;
  }
};

export const executeCommand = (
  command: string,
  args: string[],
  usr: string,
  permission: number,
): Promise<boolean> => {
  return new Promise((resolve) => {
    commandQueue.push({ command, args, usr, permission, resolve });
    processQueue();
  });
};



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
    username: "bot",
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
    
    if (usr == "moooomoooo") return;

    const [playerCommand, ...playerCommandArgs] = msg.split(" ");
    const uuid = await getUUID(usr);
    const player = await getPlayer(uuid);

    sendWebhookMessage(
      usr,
      uuid,
      `${msg}`,
      { color: 0x800080 },
    );

    console.log(`WHISPER <${usr}> ${msg}`);

    if (!playerCommand) return;

    executeCommand(playerCommand, playerCommandArgs, usr, player.permission);
  });

  bot.on("message", async (message) => {
    const usr: string = message.json["extra"]?.[0]?.extra?.[1]?.text;
    let msg: string = message.json["extra"]?.[2]?.text.slice(1);

    if (!usr || !msg) return;

    const uuid = await getUUID(usr);

    const player = await getPlayer(uuid);

    sendWebhookMessage(
      usr,
      uuid,
      `${msg}`,
      msg.startsWith(">") ? { color: 0x00ff00 } : undefined,
    );

    bot.swingArm("right");

    msg = sanitizeMessage(msg);

    console.log(`<${usr}> ${msg}`);

    if (usr == "loc_") return;

    if (++chatCounter >= 100) {
      bot.chat(data.spamMessages[data.currentSpam]);
      rotateMessage();
      chatCounter = 0;
    }

    if (
      msg.toLowerCase().includes("meow") ||
      msg.toLowerCase().includes("mreow")
    ) {
      await updatePlayer(uuid, { meows: player.meows + 1 });
    }

    if (!msg.startsWith(prefix)) return;

    const [playerCommand, ...playerCommandArgs] = msg.slice(1).split(" ");

    if (!playerCommand) return;

    executeCommand(playerCommand, playerCommandArgs, usr, player.permission);
  });
};

registerBot();
runAPI();
