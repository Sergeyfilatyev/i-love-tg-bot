// bot.js
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);

const channel1 = process.env.CH1;
const channel2 = process.env.CH2;
const adminChatId = Number(process.env.CHAT_ID);
const userState = {};

// Функция для отображения главного меню
function showMainMenu(ctx) {
  const isAdmin = ctx.from.id === adminChatId;

  // Создаем меню с учетом прав администратора
  const menuButtons = [
    [Markup.button.callback("Отправить сообщение в канал📨", "send_message")],
    [Markup.button.callback("Голосовать за канал 🧡", "vote_channel")],
  ];

  // Если пользователь - администратор, добавляем кнопку перезапуска
  if (isAdmin) {
    menuButtons.push([
      Markup.button.callback("Перезапустить бота", "restart_bot"),
    ]);
  }

  ctx.reply("Выберите действие:", Markup.inlineKeyboard(menuButtons));
}

// Обработка команды /start
bot.start((ctx) => {
  // Очищаем состояние пользователя
  delete userState[ctx.from.id];

  showMainMenu(ctx);
});

// Обработка нажатия кнопки "Перезапустить бота" (только для администратора)
bot.action("restart_bot", (ctx) => {
  if (ctx.from.id === adminChatId) {
    ctx.reply("Бот перезапускается...");

    // Завершаем процесс
    process.exit(0);
  } else {
    ctx.reply("У вас нет прав для выполнения этой команды.");
  }
});

// Обработка команды /restart (только для администратора)
bot.command("restart", (ctx) => {
  if (ctx.from.id === adminChatId) {
    ctx.reply("Бот перезапускается...");

    // Завершаем процесс
    process.exit(0);
  } else {
    ctx.reply("У вас нет прав для выполнения этой команды.");
  }
});

// Обработка нажатия кнопки "Отправить сообщение"
bot.action("send_message", async (ctx) => {
  // Проверяем подписку на каналы
  const subscribedToChannel1 = await isUserSubscribed(ctx, channel1);
  const subscribedToChannel2 = await isUserSubscribed(ctx, channel2);

  if (subscribedToChannel1 && subscribedToChannel2) {
    // Предлагаем выбрать канал для отправки сообщения
    ctx.reply(
      "В какой канал вы хотите отправить сообщение?",
      Markup.inlineKeyboard([
        [Markup.button.callback("Я люблю🧡", "choose_channel1")],
        [Markup.button.callback("Я хочу🖤", "choose_channel2")],
        [Markup.button.callback("Вернуться в главное меню", "main_menu")],
      ])
    );
  } else {
    // Предлагаем подписаться на каналы
    ctx.reply(
      "Пожалуйста, подпишитесь на 2 канала, чтобы отправить сообщение:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Я люблю🧡", url: "https://t.me/+5F-DfZBzZXFlZWYy" }],
            [{ text: "Я хочу🖤", url: "https://t.me/+_-cW4wAMnq8wZDgy" }],
            [{ text: "Я подписался", callback_data: "check_subscription" }],
            [{ text: "Вернуться в главное меню", callback_data: "main_menu" }],
          ],
        },
      }
    );
  }
});

// Обработка нажатия кнопки "Голосовать за канал"
bot.action("vote_channel", (ctx) => {
  ctx.reply(
    "Выберите канал для голосования:",
    Markup.inlineKeyboard([
      [
        {
          text: "Буст Я люблю🧡",
          url: "https://t.me/boost/i_loveeeitttt",
        },
      ],
      [
        {
          text: "Буст Я хочу🖤",
          url: "https://t.me/boost/iwantyoulav",
        },
      ],
      [Markup.button.callback("Вернуться в главное меню", "main_menu")],
    ])
  );
});

// Обработка нажатия кнопки "Я подписался"
bot.action("check_subscription", async (ctx) => {
  const subscribedToChannel1 = await isUserSubscribed(ctx, channel1);
  const subscribedToChannel2 = await isUserSubscribed(ctx, channel2);

  if (subscribedToChannel1 && subscribedToChannel2) {
    ctx.reply(
      "Спасибо за подписку! Теперь вы можете отправить свое сообщение.",
      Markup.inlineKeyboard([
        [Markup.button.callback("Отправить сообщение", "send_message")],
        [Markup.button.callback("Вернуться в главное меню", "main_menu")],
      ])
    );
  } else {
    ctx.reply("Пожалуйста, убедитесь, что вы подписаны на 2 канала.");
  }
});

// Обработка нажатия кнопки "Вернуться в главное меню"
bot.action("main_menu", (ctx) => {
  // Очищаем состояние пользователя
  delete userState[ctx.from.id];

  showMainMenu(ctx);
});

// Обработка выбора канала для отправки сообщения
bot.action(["choose_channel1", "choose_channel2"], (ctx) => {
  const selectedChannel =
    ctx.callbackQuery.data === "choose_channel1" ? "Я люблю🧡" : "Я хочу🖤";

  // Сохраняем выбранный канал в состоянии пользователя
  userState[ctx.from.id] = { selectedChannel };

  ctx.reply(
    "Пожалуйста, напишите ваше сообщение",
    Markup.inlineKeyboard([[Markup.button.callback("Отмена", "cancel")]])
  );
});

// Обработка нажатия кнопки "Отмена"
bot.action("cancel", (ctx) => {
  // Очищаем состояние пользователя
  delete userState[ctx.from.id];
  ctx.reply(
    "Действие отменено.",
    Markup.inlineKeyboard([
      [Markup.button.callback("Вернуться в главное меню", "main_menu")],
    ])
  );
});

// Обработка входящих сообщений разных типов
bot.on("message", async (ctx) => {
  const state = userState[ctx.from.id];

  // Если пользователь находится в процессе отправки сообщения
  if (state && state.selectedChannel) {
    const selectedChannel = state.selectedChannel;

    try {
      // Пересылаем сообщение администратору с информацией о пользователе и выбранном канале
      await forwardMessageToAdmin(ctx, selectedChannel);

      // Уведомляем пользователя
      await ctx.reply(
        "Ваше сообщение отправлено администратору на рассмотрение 🧡",
        Markup.inlineKeyboard([
          [Markup.button.callback("Вернуться в главное меню", "main_menu")],
        ])
      );

      // Очищаем состояние пользователя
      delete userState[ctx.from.id];
    } catch (error) {
      console.error("Ошибка при отправке сообщения администратору:", error);
      await ctx.reply(
        "Произошла ошибка при отправке вашего сообщения. Пожалуйста, попробуйте позже."
      );
    }
  }
});

// Обновленная функция пересылки сообщения администратору
async function forwardMessageToAdmin(ctx, selectedChannel) {
  const message = ctx.message;

  // Информация о пользователе и выбранном канале
  const userInfo =
    `Пользователь: ${ctx.from.first_name} ${ctx.from.last_name || ""} (@${
      ctx.from.username || "не указан"
    })\n` + `Хочет опубликовать сообщение в: ${selectedChannel}`;

  // Отправляем информацию администратору
  await ctx.telegram.sendMessage(adminChatId, userInfo);

  // Пересылаем сообщение администратору
  await ctx.telegram.copyMessage(adminChatId, ctx.chat.id, message.message_id);
}

// Функция проверки подписки на каналы
async function isUserSubscribed(ctx, channel) {
  try {
    const member = await ctx.telegram.getChatMember(channel, ctx.from.id);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch (error) {
    console.error(`Ошибка при проверке подписки на канал ${channel}:`, error);
    // Возвращаем false без уведомления пользователя
    return false;
  }
}

bot.launch();
console.log("Бот запущен");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
