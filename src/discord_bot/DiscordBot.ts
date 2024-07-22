const { Client, GatewayIntentBits } = require('discord.js');
const { Ready } = require('./ready/Ready');
const { InteractionCreate } = require('./interaction_create/InteractionCreate');
const { MessageCreate } = require('./message_create/MessageCreate');
const { GuildMemberRemove } = require('./guild_member_remove/GuildMemberRemove');

require('dotenv').config();


/**
 * 235botクラス
 * ここには主に235botを動かすための基本的な初期設定や起動させるためのメソッドなどが書いてある。
 */
export class DiscordBot extends Client {
  private _celebrateMillionMemberReactionList: string[] = [];
  private _celebrate235MemberReactionCount: number = 0;
  private _usedMaleEventCommandReactionCount: number = 0;
  private readonly discordToken = process.env.DISCORD_TOKEN;
  private readonly _serverIdFor235 = process.env.SERVER_ID_FOR_235;
  private readonly _channelIdFor235ChatPlace = process.env.CHANNEL_ID_FOR_235_CHAT_PLACE;
  private readonly _channelIdFor235Introduction = process.env.CHANNEL_ID_FOR_235_INTRODUCTION;
  private readonly _userIdForUtatane = process.env.USER_ID_FOR_UTATANE;
  private readonly _userIdForMaki = process.env.USER_ID_FOR_MAKI;

  constructor() {
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
  }

  get celebrateMillionMemberReactionList(): string[] {
    return this._celebrateMillionMemberReactionList;
  }

  set celebrateMillionMemberReactionList(celebrateMillionMemberReactionList: string[]) {
    this._celebrateMillionMemberReactionList = celebrateMillionMemberReactionList;
  }

  get celebrate235MemberReactionCount(): number {
    return this._celebrate235MemberReactionCount;
  }

  set celebrate235MemberReactionCount(celebrate235MemberReactionCount: number) {
    this._celebrate235MemberReactionCount = celebrate235MemberReactionCount;
  }

  get usedMaleEventCommandReactionCount(): number {
    return this._usedMaleEventCommandReactionCount;
  }

  set usedMaleEventCommandReactionCount(usedMaleEventCommandReactionCount: number) {
    this._usedMaleEventCommandReactionCount = usedMaleEventCommandReactionCount;
  }

  get serverIdFor235() {
    return this._serverIdFor235;
  }

  get channelIdFor235ChatPlace() {
    return this._channelIdFor235ChatPlace;
  }

  get channelIdFor235Introduction() {
    return this._channelIdFor235Introduction;
  }

  get userIdForUtatane() {
    return this._userIdForUtatane;
  }

  get userIdForMaki() {
    return this._userIdForMaki;
  }

  /**
   * 235botを起動させる。
   *
   * @return {void}
   */
  public start(): void {
    this.login(this.discordToken);

    // 常時行う処理
    new Ready(this).readyEvent();

    // スラッシュコマンドが使われた時に行う処理
    new InteractionCreate(this).interactionCreateEvent();

    // メッセージが送信された時に行う処理
    new MessageCreate(this).messageCreateEvent();

    // サーバーから誰かが退出した時に行う処理
    new GuildMemberRemove(this).guildMemberRemoveEvent();
  }
}
