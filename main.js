const { Client } = require('selfo.js');
const { tokens, readChannel, writeChannel, sendAttachments, convertEmojis, showAuthor, showAvatar, typing, ignoreWebhooks, ignoreMentions, prefix, nicknames, blacklist } = require('./settings.json');
let { twoSided } = require('./settings.json');

let queue = [];
let bots = [];
let reader;
let writer;
let emojisRead, emojisWrite;

prefix && (twoSided = false);

function enqueue(msg, channelId) { // TODO Make one queue for each channel
    let fn = sendMessage.bind(null, msg, channelId);
    if (queue[0] === undefined) {
        function next() {
            queue.shift();
            queue[0] && queue[0]().finally(next);
        }
        fn().finally(next);
    }
    queue.push(fn);
}

const sendMessage = async(msg, channelId) => {
    return new Promise(resolve => {
        // Ignore messages from bots
        if(bots.some(bot => bot.user.id == msg.author.id)) return resolve();
        // Ignore messages from writer
        if(writer?.user?.id == msg.author.id) return resolve();
    
        let bot = bots.find(x => x.echo.includes(msg.author.id));
        if(!bot) {
            const random = Math.floor(Math.random() * bots.length);
            bots[random].echo.push(msg.author.id);
            bot = bots[random];
        }
    
        if(convertEmojis) {
            const emojis = channelId == readChannel ? emojisRead : emojisWrite;
            
            if(convertEmojis == 2 && channelId == writeChannel) {
                const hasEmoteRegex = /<a?:.+?:\d+>/gm;
                let emojiCount = 0;
                let emojisUrls = "";
                msg.emojis = msg.content.match(hasEmoteRegex);

                if(msg.emojis) {
                    msg.content = msg.content.replace(/<a?:.+?:\d+>/gm, '<EMOJI-HERE>');
                    while(msg.content.includes('<EMOJI-HERE>')) {
                        msg.content = msg.content.replace('<EMOJI-HERE>', `\`<Emoji ${++emojiCount}>\``);
                    }
    
                    for(let i=0; i< msg.emojis?.length; i++) {
                        let emoji = msg.emojis[i];

                        if(emoji.startsWith('<a:')) {
                            emoji = emoji.substring(emoji.lastIndexOf(':') + 1, emoji.length - 1);
                            emojisUrls += "\n`"+(i+1)+"`" + "https://cdn.discordapp.com/emojis/" + emoji + ".gif?v=1";
                        } else {
                            emoji = emoji.substring(emoji.lastIndexOf(':') + 1, emoji.length - 1);
                            emojisUrls += "\n`"+(i+1)+"`" + "https://cdn.discordapp.com/emojis/" + emoji + ".png?v=1";
                        }
                    }
    
                    if(emojisUrls)
                        msg.content = msg.content + "\n\n`<EMOJIS>`" + emojisUrls; // TODO Use another way to do this
                }
            } else {
                msg.content = msg.content.replace(/<a?:.+?:\d+>/gm, '<EMOJI-HERE>');
                while(msg.content.includes('<EMOJI-HERE>')) {
                    msg.content = msg.content.replace('<EMOJI-HERE>', emojis[Math.floor(Math.random() * emojis.length)] || ':pray:');
                }
            }
        }
    
        
        if(!msg.content && (!msg.attachments || !sendAttachments)) return resolve();
        
        typing && bot.channels.get(channelId).startTyping();
        
        const timeout = typing ? Math.floor(Math.random() * 120) + 200 : 0;
        
        setTimeout(async() => {
            try {
                if(showAuthor && channelId == writeChannel) {
                    const webhook = msg.webhookID ? "`<WEBHOOK>` " : "";
                    if(nicknames[msg.author.id]) {
                        msg.content = `${webhook}\`${nicknames[msg.author.id]} (${Object.keys(nicknames)?.indexOf(msg.author.id) + 1})\`: ${msg.content}`
                    } else {
                        msg.content = `${webhook}\`${msg.author.tag} (${msg.author.id})\`: ${msg.content}`;
                    }
                }

                if(showAvatar && channelId == writeChannel) {
                    const url = msg.author.avatarURL;
                    if(url) {
                        await bot.channels.get(channelId).send(url.replace(/size=\d+/g, "size=44")); // TODO test with gif xD
                    } else {
                        await bot.channels.get(channelId).send("", {
                            files: ["./src/avatar.png"]
                        });
                    }
                }

                if(sendAttachments)
                    await bot.channels.get(channelId).send(msg.content, {
                        files: msg.attachments.map(x => x.url)
                    });
                else
                    await bot.channels.get(channelId).send(msg.content);
            } catch(e) {
                console.log(e);
            } finally {
                bot.channels.get(channelId).stopTyping();
                resolve();
            }
        }, msg.content.replace(/<a?:.+?:\d+>/gm, '').replace(/https:\/\/cdn.discordapp.com\/emojis\/.+?v\=1/gm, '').replace(/\<Emoji \d+\>/gm, '').length * timeout);
        // TODO xD
    });
}

const run = async() => {
    console.log('Starting bots...');
    console.log('\x1b[36m==================================================\x1b[0m');
    for(let i=0; i<tokens.length; i++) {
        const bot = new Client();
        bot.on('ready', () => {
            if(prefix && i == tokens.length -1) {
                writer = bot;
                process.stdout.write(`\x1b[35m[W]\x1b[0m`);
            } else {
                bots.push({
                    echo: [],
                    ...bot
                });
                if(i != 0) process.stdout.write(`\x1b[34m[-]\x1b[0m`);
            }
            if(i == 0) {
                reader = bot;
                if(convertEmojis) {
                    emojisWrite = reader.channels.get(writeChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
                    emojisRead = reader.channels.get(readChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
                }
                process.stdout.write(`\x1b[32m[R]\x1b[0m`);
            }
            console.log(`\x1b[33m[${i+1}/${tokens.length}]\x1b[0m ${bot.user.tag}`);
        });
        bot.on('message', (msg) => { // TODO Replace mentions with actual bot
            if(ignoreWebhooks ? (msg.author.bot) : (msg.author.bot && !msg.webhookID ) || msg.author.id == reader.user.id) return;
            const channels = twoSided ? [readChannel, writeChannel] : [readChannel];
            if(i == 0 && channels.includes(msg.channel.id)) {
                // Mentions
                if(ignoreMentions) {
                    msg.content = msg.content.replace(/<@!?\d+>/g, '');
                }
                if(msg.content && !blacklist.includes(msg.content.toLowerCase()))
                    enqueue(msg, msg.channel.id == writeChannel ? readChannel : writeChannel);
            }
            if(prefix && i == tokens.length -1 && msg.content.toLowerCase().startsWith(prefix.toLowerCase())) {
                const m = msg.content.substring(prefix.length).trim();
                writer.channels.get(readChannel).send(m);
            }
        });
        
        await bot.login(tokens[i]);
    }
    console.log('\x1b[36m==================================================\x1b[0m');
};

run();