const db = require('../models/index');
const func = require('./function');
const information = require('../data/information/informationData.json');
const express = require('express');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;

// AtCoder用
const https = require("https");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const url = "https://atcoder.jp/contests/?lang=ja";

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


dotenv.config();

app.get('/', (req: any, res: any): void => res.send('Hello, world.'));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


client.on('ready', () => {
  console.log('235bot is login now.');
});

client.login(process.env.DISCORD_TOKEN);
