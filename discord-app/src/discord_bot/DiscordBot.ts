const { Client, GatewayIntentBits } = require('discord.js');
const Ready = require('./ready/Ready').default;
const InteractionCreate = require('./interaction_create/InteractionCreate').default;
const MessageCreate = require('./message_create/MessageCreate').default;
const GuildMemberRemove = require('./guild_member_remove/GuildMemberRemove').default;
const VoiceStateUpdate = require('./voice_state_update/VoiceStateUpdate').default;

require('dotenv').config();

/**
 * 235botクラス
 * ここには主に235botを動かすための基本的な初期設定や起動させるためのメソッドなどが書いてある。
 */
export default class DiscordBot extends Client {
  private _celebrateMillionMemberReactionEmoji: string = '';

  private _isReactionCelebrate235MemberMessage: boolean = true;

  private _usedMaleEventCommandReactionCount: number = 0;

  private _dividedUserIdList: string[] = [];

  private _connection: any;

  private readonly discordToken = process.env.DISCORD_TOKEN;

  private readonly _serverIdFor235 = process.env.SERVER_ID_FOR_235;

  private readonly _channelIdFor235ChatPlace = process.env.CHANNEL_ID_FOR_235_CHAT_PLACE;

  private readonly _channelIdFor235Introduction = process.env.CHANNEL_ID_FOR_235_INTRODUCTION;

  private readonly _channelIdFor235ListenOnly = process.env.CHANNEL_ID_FOR_235_LISTEN_ONLY;

  private readonly _channelIdFor235ListenOnly2 = process.env.CHANNEL_ID_FOR_235_LISTEN_ONLY_2;

  private readonly _voiceChannelIdFor235ChatPlace = process.env.VOICE_CHANNEL_ID_FOR_235_CHAT_PLACE;

  private readonly _voiceChannelIdFor235ChatPlace2 = process.env
    .VOICE_CHANNEL_ID_FOR_235_CHAT_PLACE_2;

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
      ],
    });
  }

  get celebrateMillionMemberReactionEmoji(): string {
    return this._celebrateMillionMemberReactionEmoji;
  }

  set celebrateMillionMemberReactionEmoji(celebrateMillionMemberReactionEmoji: string) {
    this._celebrateMillionMemberReactionEmoji = celebrateMillionMemberReactionEmoji;
  }

  get isReactionCelebrate235MemberMessage(): boolean {
    return this._isReactionCelebrate235MemberMessage;
  }

  set isReactionCelebrate235MemberMessage(isReactionCelebrate235MemberMessage: boolean) {
    this._isReactionCelebrate235MemberMessage = isReactionCelebrate235MemberMessage;
  }

  get usedMaleEventCommandReactionCount(): number {
    return this._usedMaleEventCommandReactionCount;
  }

  set usedMaleEventCommandReactionCount(usedMaleEventCommandReactionCount: number) {
    this._usedMaleEventCommandReactionCount = usedMaleEventCommandReactionCount;
  }

  get dividedUserIdList(): string[] {
    return this._dividedUserIdList;
  }

  set dividedUserIdList(dividedUserIdList: string[]) {
    this._dividedUserIdList = dividedUserIdList;
  }

  get connection(): any {
    return this._connection;
  }

  set connection(connection: any) {
    this._connection = connection;
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

  get channelIdFor235ListenOnly() {
    return this._channelIdFor235ListenOnly;
  }

  get channelIdFor235ListenOnly2() {
    return this._channelIdFor235ListenOnly2;
  }

  get voiceChannelIdFor235ChatPlace() {
    return this._voiceChannelIdFor235ChatPlace;
  }

  get voiceChannelIdFor235ChatPlace2() {
    return this._voiceChannelIdFor235ChatPlace2;
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

    // ボイスチャンネルに誰かが参加/退出した時に行う処理
    new VoiceStateUpdate(this).voiceStateUpdateEvent();
  }
}
