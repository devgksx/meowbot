import { Bot, createBot } from "mineflayer"
import antiafk = require("mineflayer-antiafk");

import fs from 'fs';
import path from 'path';

import { load, save } from "./db/manage";

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const prefix = config["PREFIX"];

export let bot: Bot;

export interface Command {
  command: string;
  desc: string;
  usage: string;
  permission: number;
  exec(username: string, args: string): Promise<boolean>;
}

const sanitizeMessage = (msg: string) => msg.replace(/[^\x00-\x7F]/g, ""); 

const rotateMessage = async () => {
  data.currentSpam + 1 > data.spamMessages.length - 1 ? data.currentSpam = 1 : data.currentSpam++;
}

export let data = {
  "spamMessages": ["meow 🐈", "meow~ ❤️", "mrreow!!!"],
  "currentSpam": 0,
  "meowCounter": {
  },
  "permissions": {
    "gksx" : 10
  }
};

export const updateData = (newData: any) => {
  data = newData;
}

export let commands: Command[] = [];

export const loadCommands = async (): Promise<Command[]> => {
  const commandsDir = path.join(__dirname, 'commands');
  const commands: Command[] = [];

  return new Promise((resolve, reject) => {
    fs.readdir(commandsDir, async (err, files) => {
      if (err) {
        console.error('Error reading commands directory:', err);
        return reject(err);
      }

      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const commandPath = path.join(commandsDir, file);

          try {
            const commandModule = await import(commandPath);
            const commandName = path.basename(file, path.extname(file));

            const command = commandModule[commandName + "Command"] as Command;

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
    host : "localhost",
    port : 25568,
    username : process.env.USERNAME,
    auth : "microsoft",
    version : "1.20.6"
  })

  load();
  
  console.log(data);

  commands = await loadCommands();

  let chatCounter = 0;

  bot.loadPlugin(antiafk);

  bot.on("spawn", () => {
    bot.afk.setOptions({ fishing: false }); //disables fishing
    bot.afk.start();
  });
  
  bot.on('error', (err) => console.error(err));
  bot.on('end', registerBot);

  bot.on("whisper", (usr: string, msg: string) => {
    let playerCommand = msg.split(" ")[0];
    let playerCommandArgs = msg.split(" ")[1];
    
    console.log(`WHISPER <${usr}> ${msg}`);
    
    if (!playerCommand) return;
    
    commands.forEach(cmd => {

      //console.log(`${playerCommand}, ${cmd.command}`)

      if (playerCommand.toLowerCase() == cmd.command.toLowerCase() && (data.permissions[usr] || 1) >= cmd.permission) {
        cmd.exec(usr, playerCommandArgs);
      }

    });
  
  });

  bot.on('chat', (usr: string, msg: string ) => {
    if (usr == "whispers") return;
    
    msg = sanitizeMessage(msg);

    console.log(`<${usr}> ${msg}`);

    if (usr == "loc_" || msg.toLowerCase().includes(data.spamMessages[data.currentSpam])) return;
    
    if (msg.toLowerCase().includes("top 10 meowers:")) return;

    if (++chatCounter >= 50) {
      bot.chat(data.spamMessages[data.currentSpam]);
      if (chatCounter >= 100)
        rotateMessage();
      chatCounter = 0;
      save();
    }

    if ((msg.toLowerCase().includes("meow") || msg.toLowerCase().includes("mreow")) && !msg.includes("$")) 
      data.meowCounter[usr] = (data.meowCounter[usr] || 0) + 1;

    if (!msg.startsWith(prefix)) return;

    let playerCommand = msg.split(prefix)[1].split(" ")[0];
    let playerCommandArgs = msg.split(prefix)[1].split(" ")[1];

    if (!playerCommand) return;

    commands.forEach(cmd => {

      //console.log(`${playerCommand}, ${cmd.command}`)

      if (playerCommand.toLowerCase() == cmd.command.toLowerCase() && (data.permissions[usr] || 1) >= cmd.permission) {
        cmd.exec(usr, playerCommandArgs).then((succeeded) => {
          if (succeeded) return;
          console.error(`${usr} executed ${cmd.command} and an error occured`);
        });
      }

    });

  });

}

registerBot();


