const { Client } = require('selfo.js');
const { tokens, readChannel, writeChannel, sendAttachments, convertEmojis, showAuthor, showAvatar, typing, ignoreWebhooks, ignoreMentions, prefix, nicknames, blacklist } = require('./settings.json');
let { twoSided } = require('./settings.json');

let queue = {};
let bots = [];
let reader;
let writer;
let emojisRead, emojisWrite;

prefix && (twoSided = false);

function enqueue(msg, channelId) { // Queue per bot
    if(!queue[channelId]) queue[channelId] = [];
    let fn = sendMessage.bind(null, msg, channelId);
    if (queue[channelId][0] === undefined) {
        function next() {
            queue[channelId].shift();
            queue[channelId][0] && queue[channelId][0]().finally(next);
        }
        fn().finally(next);
    }
    queue[channelId].push(fn);
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
            const emojis = Array.isArray(readChannel) ? (readChannel.includes(channelId) ? emojisRead : emojisWrite) : (readChannel == channelId ? emojisRead : emojisWrite);
            
            if(convertEmojis == 2 && (Array.isArray(writeChannel) ? (writeChannel.includes(channelId)) : (writeChannel == channelId))) {
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
            try { // TODO check msg content length
                if(showAuthor && (Array.isArray(writeChannel) ? (writeChannel.includes(channelId)) : (writeChannel == channelId))) {
                    const webhook = msg.webhookID ? "`<WEBHOOK>` " : "";
                    if(nicknames[msg.author.id]) {
                        msg.content = `${webhook}\`${nicknames[msg.author.id]} (${Object.keys(nicknames)?.indexOf(msg.author.id) + 1})\`: ${msg.content}`
                    } else {
                        msg.content = `${webhook}\`${msg.author.tag} (${msg.author.id})\`: ${msg.content}`;
                    }
                }

                if(msg.originChannel && (Array.isArray(writeChannel) ? (writeChannel.includes(channelId)) : (writeChannel == channelId))) {
                    const channel = reader.channels.get(msg.originChannel);
                    msg.content = `\`${channel?.name}\` ` + msg.content;
                }

                if(showAvatar && (Array.isArray(writeChannel) ? (writeChannel.includes(channelId)) : (writeChannel == channelId))) {
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
                    emojisWrite = reader.channels.get(Array.isArray(writeChannel) ? writeChannel[0] : writeChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
                    emojisRead = reader.channels.get(Array.isArray(readChannel) ? readChannel[0] : readChannel).guild.emojis.array().map(x => x.toString()).filter(x => !x.startsWith('<a'));
                }
                process.stdout.write(`\x1b[32m[R]\x1b[0m`);
            }
            console.log(`\x1b[33m[${i+1}/${tokens.length}]\x1b[0m ${bot.user.tag}`);
        });
        bot.on('message', (msg) => { // TODO Replace mentions with actual bot
            if(ignoreWebhooks ? (msg.author.bot) : (msg.author.bot && !msg.webhookID ) || msg.author.id == reader.user.id) return;
            const channels = twoSided ? ([...(Array.isArray(readChannel) ? readChannel : [readChannel]), ...(Array.isArray(writeChannel) ? writeChannel : [writeChannel])]) : ([...(Array.isArray(readChannel) ? readChannel : [readChannel])]);
            if(i == 0 && channels.includes(msg.channel.id)) {
                // Mentions
                if(ignoreMentions) {
                    msg.content = msg.content.replace(/<@!?\d+>/g, '');
                    msg.content = msg.content.replace(/<@&!?\d+>/g, '');
                }
                if(msg.content && !blacklist.includes(msg.content.toLowerCase())) {
                    // Send to respective channel
                    if(Array.isArray(readChannel)) {
                        if(readChannel.length > 1) { // read[] *
                            if(Array.isArray(writeChannel)) {
                                if(writeChannel.length > 1) { // * read[] * write[]
                                    const read = readChannel.includes(msg.channel.id);
                                    const index = (read ? readChannel.indexOf(msg.channel.id) : writeChannel.indexOf(msg.channel.id));

                                    if(read ? writeChannel[index] : readChannel[index]) {
                                        enqueue(msg, read ? writeChannel[index] : readChannel[index]);
                                    } else {
                                        console.log('\x1b[31m[Error]\x1b[0m ' + (read ? 'Write Channel' : 'Read Channel') + ' "' + (index+1) + '" not found')
                                    }
                                } else { // * read[] 1 write[]
                                    const read = readChannel.includes(msg.channel.id);
                                    if(read) {
                                        msg.originChannel = msg.channel.id;
                                        enqueue(msg, writeChannel[0]);
                                    } else {
                                        for(const channel of readChannel) {
                                            enqueue(msg, channel);
                                        }
                                    }
                                }
                            } else { // * read[] 1 write
                                const read = readChannel.includes(msg.channel.id);
                                if(read) {
                                    msg.originChannel = msg.channel.id;
                                    enqueue(msg, writeChannel);
                                } else {
                                    for(const channel of readChannel) {
                                        enqueue(msg, channel);
                                    }
                                }
                            }
                        } else { // read[] 1
                            if(Array.isArray(writeChannel)) {
                                if(writeChannel.length > 1) { // 1 read[] * write[]
                                    const read = readChannel.includes(msg.channel.id);

                                    if(read) {
                                        for(const channel of writeChannel) {
                                            enqueue(msg, channel);
                                        }
                                    } else {
                                        msg.originChannel = msg.channel.id;
                                        enqueue(msg, readChannel[0]);
                                    }
                                } else { // 1 read[] 1 write[]
                                    const read = readChannel.includes(msg.channel.id);
                                    enqueue(msg, read ? writeChannel[0] : readChannel[0]);
                                }
                            } else { // 1 read[] 1 write
                                const read = readChannel.includes(msg.channel.id);
                                enqueue(msg, read ? writeChannel : readChannel[0]);
                            }
                        }
                    } else { // read 1
                        if(Array.isArray(writeChannel)) {
                            if(writeChannel.length > 1) { // 1 read * write[]
                                const read = readChannel == msg.channel.id;

                                if(read) {
                                    for(const channel of writeChannel) {
                                        enqueue(msg, channel);
                                    }
                                } else {
                                    msg.originChannel = msg.channel.id;
                                    enqueue(msg, readChannel);
                                }
                            } else { // 1 read 1 write[]
                                const read = readChannel == msg.channel.id;
                                enqueue(msg, read ? writeChannel[0] : readChannel);
                            }
                        } else { // 1 read 1 write
                            const read = readChannel == msg.channel.id;
                            enqueue(msg, read ? writeChannel : readChannel);
                        }
                    }
                }
            }
            if(prefix && i == tokens.length -1 && msg.content.toLowerCase().startsWith(prefix.toLowerCase())) {
                const m = msg.content.substring(prefix.length).trim();
                if(Array.isArray(readChannel)) {
                    for (const channel of readChannel) {
                        writer.channels.get(channel).send(m);
                    }
                } else {
                    writer.channels.get(readChannel).send(m);
                }
            }
        });
        
        await bot.login(tokens[i]);
    }
    console.log('\x1b[36m==================================================\x1b[0m');
};

run();