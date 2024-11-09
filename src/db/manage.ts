import { readFile, writeFile, existsSync } from "fs";
import { data, updateData } from "..";

let path = "./db.json";

export const save = () => {
  writeFile(path, JSON.stringify(data, null, 2), (error) => {
    if (error) {
      console.log("An error has occurred ", error);
      return;
    }
    console.log("Database has been saved");
  });
};

const usernameCache: Record<string, string> = {};
const uuidCache: Record<string, string> = {};

export const getUUID = async (username: string): Promise<string | null> => {
  if (uuidCache[username]) {
    return uuidCache[username];
  }

  try {
    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`,
    );
    if (!response.ok) {
      throw new Error("Response was not ok");
    }
    const data = await response.json();
    const uuid = data.id || null;

    if (uuid) {
      uuidCache[username] = uuid;
    }

    return uuid;
  } catch (error) {
    console.error("Error fetching uuid:", error);
    return null;
  }
};

export const getUsernameFromUUID = async (
  uuid: string,
): Promise<string | null> => {
  if (usernameCache[uuid]) {
    return usernameCache[uuid];
  }

  try {
    const response = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
    );
    if (!response.ok) {
      throw new Error("Response was not ok");
    }
    const data = await response.json();
    const username = data.name || null;

    if (username) {
      usernameCache[uuid] = username;
    }

    return username;
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
};

export const load = () => {
  if (!existsSync(path)) {
    console.log("Database file not found, creating new one with default data.");
    save();
    updateData({
      spamMessages: ["meow 🐈", "meow~ ❤️", "mrreow!!!"],
      currentSpam: 0,
      meowCounter: {},
      permissions: {
        "8abcc4da97154dc589a504dae800d16b": 10,
      },
    });
    return;
  }

  readFile(path, "utf8", (error, fileData) => {
    if (error) {
      console.log("An error has occurred", error);
      return;
    }

    try {
      const newData = JSON.parse(fileData);
      updateData(newData);
      console.log("Database loaded!");
    } catch (parseError) {
      console.log("Failed to parse JSON:", parseError);
    }
  });
};
