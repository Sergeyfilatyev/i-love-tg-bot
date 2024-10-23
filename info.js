const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf(botToken);
bot.start((ctx) =>
  ctx.reply("Отправь мне любое сообщение в канале, где я администратор.")
);

bot.on("message", (ctx) => {
  console.log(ctx.message);
});

bot.launch();
(async () => {
  try {
    const channelInfo1 = await bot.telegram.getChat("@channel_username1");
    console.log(`ID первого канала: ${channelInfo1.id}`);

    const channelInfo2 = await bot.telegram.getChat("@channel_username2");
    console.log(`ID второго канала: ${channelInfo2.id}`);
  } catch (error) {
    console.error("Ошибка при получении ID каналов:", error);
  } finally {
    process.exit();
  }
})();
bot.js;
