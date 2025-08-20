import DiscordBot from './discord_bot/DiscordBot';
import 'dotenv/config';

const discordBot = new DiscordBot();

// 起動
(async () => {
  await discordBot.start();
})().catch(() => console.log('235bot Login Failed.'));
