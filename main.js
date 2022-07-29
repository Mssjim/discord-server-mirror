const { Client } = require('selfo.js');
const { tokens, readChannel, writeChannel, sendAttachments, convertEmojis } = require('./settings.json');

let bots = [];
let reader;
let emojis;

const sendMessage = (msg) => {
    let bot = bots.find(x => x.echo.includes(msg.author.id));
    if(!bot) {
        const random = Math.floor(Math.random() * bots.length);
        bots[random].echo.push(msg.author.id);
        bot = bots[random];
    }

    if(convertEmojis) {
        msg.content = msg.content.replace(/<a?:.+?:\d+>/g, '<EMOJI-HERE>');
    
        while(msg.content.includes('<EMOJI-HERE>')) {
            msg.content = msg.content.replace('<EMOJI-HERE>', emojis[Math.floor(Math.random() * emojis.length)] || ':pray:');
        }
    }

    if(!msg.content) return;

    bot.channels.get(writeChannel).startTyping();
    setTimeout(() => {
        bot.channels.get(writeChannel).send(msg.content);
        bot.channels.get(writeChannel).stopTyping();
    }, msg.content.replace(/<a?:.+?:\d+>/, '').length * 280);
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
            if(i == 0) {
                reader = bot;
                emojis = reader.channels.get(writeChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
            }
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