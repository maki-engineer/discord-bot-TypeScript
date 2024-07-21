// 別ファイルで同じ変数名を設定できるように
export{}

const { DiscordBot } = require('./discord_bot/DiscordBot');
const { Ready } = require('./discord_bot/ready/Ready');
const { InteractionCreate } = require('./discord_bot/interaction_create/InteractionCreate');
const { MessageCreate } = require('./discord_bot/message_create/MessageCreate');
const { GuildMemberRemove } = require('./discord_bot/guild_member_remove/GuildMemberRemove');
const discordBot = new DiscordBot();
const ready = new Ready(discordBot);
const interactionCreate = new InteractionCreate(discordBot);
const messageCreate = new MessageCreate(discordBot);
const guildMemberRemove = new GuildMemberRemove(discordBot);


// 起動
discordBot.start();

// 常時行う処理
discordBot.on('ready', () => {
  // 235botのコマンドを設定
  ready.setCommand();

  // 235botのステータスを設定
  ready.setStatus();

  // 1分ごとに処理
  setInterval(() => {
    ready.readyEvent();
  }, 60_000);
});

// スラッシュコマンドが使われた時に行う処理
interactionCreate.interactionCreateEvent();

// メッセージが送信された時に行う処理
messageCreate.messageCreateEvent();

// サーバーから誰かが退出した時に行う処理
guildMemberRemove.guildMemberRemoveEvent();
