// 別ファイルで同じ変数名を設定できるように
export{}

require('dotenv').config({ path: '.env.development' });

const information = require('../data/information/informationData.json');

const {
  zenkakuToHankaku,
  existsSameValue,
  compareFunc,
  levenshteinDistance,
  sliceByNumber,
  hiraToKana,
  shuffle
} = require('./function');

const {
  AnniversaryData,
  BirthdayFor235Member,
  BirthdayForMillionMember,
  Command,
  CommandUsedLog,
  DeleteMessage,
  DividedMember,
  EmojiDataForMillionMemberToUseBirthday,
  EmojiForBirthday235Data,
  EmojiForBirthdayMillionIdolData,
  EmojiForMenDateData
} = require('../models/index');

// Discord bot設定
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
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
    GatewayIntentBits.GuildScheduledEvents
  ]
});


client.on('ready', () => {
  console.log('235bot is login now.');
});

client.login(process.env.DISCORD_TOKEN);
