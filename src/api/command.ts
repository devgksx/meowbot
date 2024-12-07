import { api } from "./manage";
import { Request, Response } from "express";
import { bot, executeCommand } from "..";

const RequestQueue: { command: string, args: string[] }[] = [];
const BroadcastQueue: { message: string, progress: number }[] = [];

export const registerCommandRoute = () => {
  api.get('/command/', async (req: Request, res: Response) => {
    const { command, args } = req.query;

    if (!command) {
      res.status(400).json({ error: "No command provided" });
      return;
    }

    if (!args) {
      res.status(400).json({ error: "No arguments provided" });
      return;
    }

    let response: Promise<boolean>;

    if (command.toString() == "broadcast") {
      let playersOnline = bot.players;

      if (Object.keys(playersOnline).length == 0) {
        res.status(400).json({ success: false, message: "No players online" });
        return;
      }

      let message = args.toString();
      let progress = 0;
      BroadcastQueue.push({ message, progress });

    }

    if (command.toString() === "checkbroadcast") {
      const message = args.toString();
      const foundBroadcast = BroadcastQueue.find(job => job.message === message);

      if (foundBroadcast) {
        res.status(200).json({
          success: true,
          message: "Message found in broadcast queue",
          progress: foundBroadcast.progress,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Message not found in broadcast queue",
          progress: 0,
        });
      }
      return;
    }

    if (BroadcastQueue.length == 1) {
      const broadcastJob = BroadcastQueue[0];
      const { message } = broadcastJob;
      const playersOnline = bot.players;
      const playerList = Object.keys(playersOnline);
      let i = 0;

      const interval = setInterval(() => {
        if (i < playerList.length) {
          bot.chat(`/w ${playerList[i]} ${message}`);
          let progress = Math.round((i + 1) / playerList.length * 100);
          console.log(`Broadcasting message to ${playerList[i]} | progress ${progress}%`);
          broadcastJob.progress = progress;
          i++;
        } else {
          clearInterval(interval);
          broadcastJob.progress = 100;
          BroadcastQueue.shift();
        }
      }, 2000);
    }


    if (command.toString() === "chat" && args.toString().split(" ")[0] === `/w ${bot.username}`) {
      res.status(400).json({ success: false, message: "Cannot whisper to bot" });
      return;
    }

    if (command.toString() === "chat" && args.toString().split(" ")[0] === "/w") {
      let playersOnline = bot.players;
      let player = args.toString().split(" ")[1];
      if (!playersOnline[player]) {
        res.status(400).json({ message: "Player is not online" });
        return;
      }
    }

    RequestQueue.push({ command: command.toString(), args: args.toString().split(" ") });


    if (RequestQueue.length == 1) {
      const { command, args } = RequestQueue[0];
      response = executeCommand(command, args, "API", 1);
      RequestQueue.pop();
    }

    if (command.toString() == "botinfo") {
      let onlineplayers = Object.keys(bot.players).length;
      let botPos = bot.entity.position;
      let botHealth = bot.health;
      let botFood = bot.foodSaturation;
      res.status(200).json({
        success: true,
        message: `Server is online with ${onlineplayers} players.\nBot is at ${botPos}.\nBot has ${botHealth} health and ${botFood} food saturation.`
      });
      return;
    }

    if (command.toString() == "onlineplayers") {
      let playersOnline = bot.players;
      let playerList = [];
      for (let player in playersOnline) {
        playerList.push(player);
      }
      res.status(200).json({ success: true, message: playerList });
      return;
    }

    if (command.toString() === "chat" && args.toString().split(" ")[1] === "moooomoooo") {
      let responseSent = false;

      const listener = (username: string, message: string) => {
        if (username === "moooomoooo" && !responseSent) {
          responseSent = true;
          bot.removeListener("whisper", listener);
          if (responseSent) {
            res.status(200).json({ success: true, message });
            return;
          }
        }
      };

      setTimeout(() => {
        if (!responseSent) {
          responseSent = true;
          bot.removeListener("whisper", listener);
          res.status(500).json({ message: "No response from moooomoooo" });
          return;
        }
      }, 5000);

      bot.on("whisper", listener);
      return;
    }

    try {
      const success = await response;

      if (success) {
        res.status(200).json({ success: true, message: "Whisper sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send whisper" });
      }
    } catch (err) {
      console.error(`Error executing command <${command}>:`, err);
      res.status(500).json({ error: "Failed to execute command" });
    }
  });
};

