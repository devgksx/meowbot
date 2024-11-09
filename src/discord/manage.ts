import { webhook_url, discord_enabled } from "..";

export const headCache: Record<string, string> = {};

export const getHead = async (uuid: string): Promise<string> => {
  if (headCache[uuid]) {
    return headCache[uuid];
  }

  try {
    const response = await fetch(`https://mc-heads.net/avatar/${uuid}`);
    if (!response.ok) {
      throw new Error("Response was not ok");
    }

    headCache[uuid] = response.url;

    return response.url;
  } catch (error) {
    console.error("Error fetching head:", error);
    return "";
  }
};

const removeMarkdown = (text: string) => text.replace(/([*_~`|])/g, "\\$1");

export const sendWebhookMessage = async (
  username: string,
  uuid: string,
  content: string,
  embedData?: {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
  },
) => {
  if (!webhook_url || !discord_enabled) return;

  const embed = {
    description: `**${removeMarkdown(username)}**: ${removeMarkdown(content)}`,
    color: embedData?.color || 0x0,
    footer: {
      text: "\u200b",
      icon_url: await getHead(uuid),
    },
    timestamp: `${new Date().toISOString()}`,
  };

  try {
    const response = await fetch(webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to send embed message:", error);
  }
};
