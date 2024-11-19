import { api } from "./manage";
import { Request, Response } from "express";
import { bot, executeCommand } from "..";

const RequestQueue: { command: string, args: string[] }[] = [];

export const registerCommandRoute = () => {
  api.get('/command/', (req: Request, res: Response) => {
    const { command, args } = req.query;

    if (!command) {
      res.status(400).json({ error: "No command provided" });
      return;
    }

    if (!args) {
      res.status(400).json({ error: "No arguments provided" });
      return;
    }

    RequestQueue.push({ command: command.toString(), args: args.toString().split(" ") });

    if (RequestQueue.length == 1) {
      const { command, args } = RequestQueue[0];
      executeCommand(command, args, "API", 1);
      RequestQueue.pop();
    }

    if (command.toString() == "chat" && args.toString().split(" ")[1] === "moooomoooo") {
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
  });
};

