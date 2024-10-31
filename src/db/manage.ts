import { readFile, writeFile, existsSync } from 'fs';
import { data, updateData } from '..';

let path = "./db.json";

export const save = () => {
  writeFile(path, JSON.stringify(data, null, 2), (error) => {
    if (error) {
      console.log("An error has occurred ", error);
      return;
    }
    console.log("Database has been saved");
  });
}

export const load = () => {
  if (!existsSync(path)) {
    console.log("Database file not found, creating new one with default data.");
    save();
    updateData({
      spamMessages: ["meow 🐈", "meow~ ❤️", "mrreow!!!"],
      currentSpam: 0,
      meowCounter: {},
      permissions: {
        gksx: 10,
      },
    });
    return;
  }

  readFile(path, 'utf8', (error, fileData) => {
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
}

