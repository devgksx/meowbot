import { Bot, createBot } from "mineflayer"
import antiafk = require("mineflayer-antiafk");

import { meowsCommand } from "./commands/meows";
import { topCommand } from "./commands/top";
import { load, save } from "./db/manage";
import { helpCommand } from "./commands/help";
import { saveCommand } from "./commands/save";

export let bot: Bot;

export interface Command {
  command: string;
  desc: string;
  usage: string;
  permission: number;
  exec: Function;
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

export let commands = [

  meowsCommand,
  topCommand,
  helpCommand,
  saveCommand

];

commands.forEach(command => {
  console.log(`Registered command ${command.command}`)
});

const registerBot = () => {
  bot = createBot({
    host : "localhost",
    port : 25568,
    username : process.env.USERNAME,
    auth : "microsoft",
    version : "1.20.6"
  })

  load();
  
  console.log(data);
  
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
    
    if (playerCommand == undefined) return;
    
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

    if (++chatCounter >= 50) {
      bot.chat(data.spamMessages[data.currentSpam]);
      if (chatCounter >= 100)
        rotateMessage();
      chatCounter = 0;
      save();
    }

    if ((msg.toLowerCase().includes("meow") || msg.toLowerCase().includes("mreow")) && !msg.includes("$") ) 
      data.meowCounter[usr] = (data.meowCounter[usr] || 0) + 1;

    if (!msg.startsWith("$")) return;

    let playerCommand = msg.split("$")[1].split(" ")[0];
    let playerCommandArgs = msg.split("$")[1].split(" ")[1];

    if (playerCommand == undefined) return;

    commands.forEach(cmd => {

      //console.log(`${playerCommand}, ${cmd.command}`)

      if (playerCommand.toLowerCase() == cmd.command.toLowerCase() && (data.permissions[usr] || 1) >= cmd.permission) {
        cmd.exec(usr, playerCommandArgs);
      }

    });

  });

}

registerBot();


