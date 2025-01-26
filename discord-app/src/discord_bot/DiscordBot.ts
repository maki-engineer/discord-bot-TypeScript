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

  private _speakerId: string = '62';

  private readonly discordToken = process.env.DISCORD_TOKEN;

  private readonly _connectVoiceList = [
    '接続されました！',
    '私が...来た...！！',
    'ふみこボットの登場だ～！！',
    'イェイ！！今日も一日盛り上がっていきましょう！！',
    'ふふ...私の出番が来たようですね...',
  ];

  private readonly _commandList = [
    { name: '235birthday', description: '毎月開催されるオンライン飲み会の企画文章を作成したいときに使用するコマンドです。' },
    { name: '235men', description: '毎月開催される235士官学校🌹の日程を決めるときに使用するコマンドです。' },
    { name: '235roomdivision', description: 'ボイスチャンネルに参加しているメンバーを分けたいときに使用するコマンドです。' },
    { name: '235join', description: '235botがボイスチャンネルに参加してテキストを読み上げます！' },
    { name: '235disconnect', description: '235botをボイスチャンネルから退出させます！' },
    {
      name: '235setvoice',
      description: 'テキストを読み上げる声を変更します！',
      options: [{
        type: 3,
        name: 'character',
        description: '読み上げてほしいキャラクターの声を選択してください！',
        required: true,
        // choices に追加できるのは25個まで！
        choices: [
          { name: '四国めたん', value: '2' },
          { name: 'ずんだもん', value: '3' },
          { name: '春日部つむぎ', value: '8' },
          { name: '雨晴はう', value: '10' },
          { name: '波音リツ', value: '9' },
          { name: '玄野武宏', value: '11' },
          { name: '白上虎太郎', value: '12' },
          { name: '青山龍星', value: '13' },
          { name: '冥鳴ひまり', value: '14' },
          { name: '九州そら', value: '16' },
          { name: 'もち子さん', value: '20' },
          { name: '剣崎雌雄', value: '21' },
          { name: 'WhiteCUL', value: '23' },
          { name: '後鬼', value: '27' },
          { name: 'No.7', value: '29' },
          { name: 'ちび式じい', value: '42' },
          { name: '櫻歌ミコ', value: '43' },
          { name: '小夜/SAYO', value: '46' },
          { name: 'ナースロボ＿タイプＴ', value: '47' },
          { name: '†聖騎士 紅桜†', value: '51' },
          { name: '雀松朱司', value: '52' },
          { name: '麒ヶ島宗麟', value: '53' },
          { name: '猫使ビィ', value: '58' },
          { name: '中国うさぎ', value: '62' },
          { name: '琴詠ニア', value: '74' },
        ],
      }],
    },
    {
      name: '235addword',
      description: '読み上げる単語を辞書に登録します！',
      options: [
        {
          type: 3,
          name: '単語',
          description: '登録したい単語',
          required: true,
        },
        {
          type: 3,
          name: '読み方',
          description: '読み方（全角カタカナ）',
          required: true,
        },
      ],
    },
  ];

  private readonly _serverIdFor235 = process.env.SERVER_ID_FOR_235;

  private readonly _channelIdFor235ChatPlace = process.env.CHANNEL_ID_FOR_235_CHAT_PLACE;

  private readonly _channelIdFor235Introduction = process.env.CHANNEL_ID_FOR_235_INTRODUCTION;

  private readonly _channelIdFor235ListenOnly = process.env.CHANNEL_ID_FOR_235_LISTEN_ONLY;

  private readonly _channelIdFor235ListenOnly2 = process.env.CHANNEL_ID_FOR_235_LISTEN_ONLY_2;

  private readonly _channelIdForGameListenOnly = process.env.CHANNEL_ID_FOR_GAME_LISTEN_ONLY;

  private readonly _voiceChannelIdFor235ChatPlace = process.env.VOICE_CHANNEL_ID_FOR_235_CHAT_PLACE;

  private readonly _voiceChannelIdFor235ChatPlace2 = process.env
    .VOICE_CHANNEL_ID_FOR_235_CHAT_PLACE_2;

  private readonly _voiceChannelIdForGame = process.env.VOICE_CHANNEL_ID_FOR_GAME;

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

  get speakerId(): string {
    return this._speakerId;
  }

  set speakerId(speakerId: string) {
    this._speakerId = speakerId;
  }

  get connectVoiceList(): string[] {
    return this._connectVoiceList;
  }

  get commandList() {
    return this._commandList;
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

  get channelIdForGameListenOnly() {
    return this._channelIdForGameListenOnly;
  }

  get voiceChannelIdFor235ChatPlace() {
    return this._voiceChannelIdFor235ChatPlace;
  }

  get voiceChannelIdFor235ChatPlace2() {
    return this._voiceChannelIdFor235ChatPlace2;
  }

  get voiceChannelIdForGame() {
    return this._voiceChannelIdForGame;
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
