const { Client } = require('selfo.js');
const { tokens, readChannel, writeChannel, twoSided, sendAttachments, convertEmojis, showAuthor } = require('./settings.json');

let bots = [];
let reader;
let emojisRead, emojisWrite;

const sendMessage = (msg, channelId) => {
    // Ignore messages from bots
    if(bots.some(bot => bot.user.id == msg.author.id)) return;

    let bot = bots.find(x => x.echo.includes(msg.author.id));
    if(!bot) {
        const random = Math.floor(Math.random() * bots.length);
        bots[random].echo.push(msg.author.id);
        bot = bots[random];
    }

    if(convertEmojis) {
        const emojis = channelId == readChannel ? emojisRead : emojisWrite;
        msg.content = msg.content.replace(/<a?:.+?:\d+>/g, '<EMOJI-HERE>');
    
        while(msg.content.includes('<EMOJI-HERE>')) {
            msg.content = msg.content.replace('<EMOJI-HERE>', emojis[Math.floor(Math.random() * emojis.length)] || ':pray:');
        }
    }

    if(showAuthor && channelId == writeChannel)
        msg.content = `\`${msg.author.tag} (${msg.author.id})\`: ${msg.content}`;

    if(!msg.content && (!msg.attachments || !sendAttachments)) return;

    bot.channels.get(channelId).startTyping();
    setTimeout(() => {
        if(sendAttachments)
            bot.channels.get(channelId).send(msg.content, {
                files: msg.attachments.map(x => x.url)
            });
        else
            bot.channels.get(channelId).send(msg.content);
        bot.channels.get(channelId).stopTyping();
    }, msg.content.replace(/<a?:.+?:\d+>/, '').length * 280);
}

const run = async() => {
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
                if(convertEmojis) {
                    emojisWrite = reader.channels.get(writeChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
                    emojisRead = reader.channels.get(readChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
                }
            }
        });
        bot.on('message', (msg) => { // TODO Replace mentions with actual bot
            if(msg.author.bot || msg.author.id == reader.user.id) return;
            const channels = twoSided ? [readChannel, writeChannel] : [readChannel];
            if(i == 0 && channels.includes(msg.channel.id))
                sendMessage(msg, msg.channel.id == writeChannel ? readChannel : writeChannel);
        });
        
        await bot.login(tokens[i]);
    }
    console.log('\x1b[36m==================================================\x1b[0m');
};

run();

process.on('uncaughtException', (err) => {
    console.log('\x1b[31m==================================================\x1b[0m');
    console.log('\x1b[31mCRASHED\x1b[0m - Trying to restart...');
    console.log(err);
    console.log('\x1b[31m==================================================\x1b[0m');

    setTimeout(() => {
        run();
    }, 3000);
});