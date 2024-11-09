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
