const { Client } = require('selfo.js');
const { tokens, readChannel, writeChannel, sendAttachments } = require('./settings.json');

let bots = [];
let reader;

const sendMessage = (msg) => {
    let bot = bots.find(x => x.echo.includes(msg.author.id));
    if(!bot) {
        const random = Math.floor(Math.random() * bots.length);
        bots[random].echo.push(msg.author.id);
        bot = bots[random];
    }

    bot.channels.get(writeChannel).startTyping();
    setTimeout(() => {
        bot.channels.get(writeChannel).send(msg.content);
        bot.channels.get(writeChannel).stopTyping();
    }, msg.content.length * 280);
}

(async() => {
    console.log('Starting bots...');
    console.log('\x1b[36m==================================================\x1b[0m');
    for(let i=0; i<tokens.length; i++) {
        const bot = new Client();
        bot.on('ready', () => {
            console.log(`\x1b[33m[${i+1}/${tokens.length}]\x1b[0m ${bot.user.tag}`);
            bots.push({
                echo: [],
                ...bot
            });
            if(i == 0) reader = bot;
        });
        bot.on('message', (msg) => {
            if(msg.author.bot || msg.author.id == reader.user.id) return;
            if(i == 0 && msg.channel.id == readChannel)
                sendMessage(msg);
        });
        
        await bot.login(tokens[i]);
    }
    console.log('\x1b[36m==================================================\x1b[0m');
})();