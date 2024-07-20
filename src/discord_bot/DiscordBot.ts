const { Client, GatewayIntentBits } = require('discord.js');


/**
 * 235botクラス
 * ここには主に235botを動かすための基本的な初期設定や起動させるためのメソッドなどが書いてある。
 */
export class DiscordBot extends Client {
  private readonly discordToken: string;

  constructor(discordToken: string) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
      ]
    });
    this.discordToken = discordToken;
  }

  /**
   * 235botを起動させる。
   *
   * @return {void}
   */
  public start(): void {
    this.login(this.discordToken);
  }
}
