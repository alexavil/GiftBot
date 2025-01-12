require("dotenv/config");

const TelegramBot = require("node-telegram-bot-api");

const sql = require("better-sqlite3");
let data = new sql("./data/users.db");

data.prepare("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, tgid STRING UNIQUE, name STRING, tickets INTEGER)").run();

const bot = new TelegramBot(process.env.TOKEN, {
    polling: true,
    onlyFirstMatch: true,
});

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    data.prepare(`INSERT OR IGNORE INTO users(tgid, name, tickets) VALUES (${userId}, '${username}, 0')`).run();
    bot.sendMessage(
        chatId,
        `Примите участие в розыгрыше призов и станьте победителем!
Для того, чтобы участвовать, необходимо купить билет.`
    );
});

bot.onText(/\/help/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `/ticket - купить билеты
/stats - проверить количество билетов`
    );
});

bot.onText(/\/ticket/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendInvoice(chatId, "Билет для участия в розыгрыше", "Купив билет, вы получите шанс стать победителем в следующем розыгрыше!", "ticket", "", "XTR", [ { label: "Ticket", amount: 1, }, ])
});