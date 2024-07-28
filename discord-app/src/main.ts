const DiscordBot = require('./discord_bot/DiscordBot').default;

const discordBot = new DiscordBot();

// 起動
discordBot.start();
