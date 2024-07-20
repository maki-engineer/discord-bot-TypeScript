// 別ファイルで同じ変数名を設定できるように
export{}

require('dotenv').config({ path: '.env.development' });

const { DiscordBot } = require('./discord_bot/DiscordBot');
const { InteractionCreate } = require('./discord_bot/interaction_create/InteractionCreate');
const { MessageCreate } = require('./discord_bot/message_create/MessageCreate');
const discordBot = new DiscordBot(process.env.DISCORD_TOKEN);
const interactionCreate = new InteractionCreate(discordBot);
const messageCreate = new MessageCreate(discordBot);


// 起動
discordBot.start();

// 常時行う処理
discordBot.on('ready', () => {
  console.log('235bot is login now.');
});

// スラッシュコマンドが使われた時に行う処理
interactionCreate.interactionCreateEvent();

// メッセージが送信された時に行う処理
messageCreate.messageCreateEvent();

// サーバーから誰かが退出した時に行う処理
