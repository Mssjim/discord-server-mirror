<div align="center">
  <br />
  <p>
    <img src="./logo.png" width="800" alt="discord-server-mirror" />
  </p>
  <br />
</div>

## About
Mirror discord messages between servers.

## Warning
Selfbots violate Discord TOS and may also violate server rules. Be careful about how you use this module and use at your risk.

## Requirements
Node.js 12.x or higher with npm/yarn installed.

## How to use
• Join with the same account on both servers. (You can use more than one account if you want)  
• Get one channel id from each server. ("Read" and "Write" channels)  
• Add your account token and channels IDs to "settings.json" file.  
• Run the `start.bat` or `start.sh` file, at Windows or Linux, respectively.

Or run the bot manually:
> • Running `npm start` or `yarn start` to update dependencies and start the bot.  
> • Or do by yourself using `npm i` or `yarn` to install dependencies and `node main.js` to start the script.

## Settings
You can edit the settings.json file with your personal preferences.
> **`readChannel`, `writeChannel` and `tokens` are required, all other flags are optional.**

`readChannel` - The channel id where you read messages from.
> You can also pass an array of channel ids to read messages from multiple channels  

`writeChannel` - The channel id where you write messages to.  
> You can also pass an array of channel ids to write messages to multiple channels  

`twoSided` - If true, messages will be mirrored between the two channels. If false, only messages from the read channel will be mirrored.  

`sendAttachments` - If true, attachments will be sent. If false, attachments will be ignored, and only text will be sent.  

`convertEmojis` - You can choice to keep server emojis like the origin, convert server emojis to a random emoji in the target server or send the emoji image link.  
> `0` - to keep same emoji, useful for nitro accounts.   
> `1` - to convert.  
> `2` - to send the image link(s).  

> You can also use `false` or `true` for keep or convert emojis, respectively.  

`showAuthor` - If true, the message will contain the author tag and id. If false, will send only the message content.  

`showAvatar` - If true, will be displayed the author avatar before message content.  

`typing` - If true, the self will simulate the message typing time before sending.  

`ignoreWebhooks` - If true, weebhook messages will be ignored.  

`ignoreMentions` - If true, all mentions in the message will be removed. (member and role mentions)  

`prefix` - You can set a prefix to send messages from "writeChannel" to "readChannel", when setting a prefix, the "twoSided" flag will be automatically disabled.  

`tokens` - An array of account tokens. You need to have at least one token.  
> Multiple tokens can be separated by commas:
> ```json
>"tokens": [
>    "token1",
>    "token2",
>    "token3"
>]
> ```
> *settings.json*
> 
> **Make sure all accounts are joined on both servers and have necessary permissions.**  
> 
> The first token will be used to read the messages, and the last one will be used to send messages via commands (if a "prefix" is defined).  

`nicknames` - A list with custom nicknames to show at message if `showAuthor` flag is true.  
> Usage example
>```json
>"nicknames": {
>    "user1Id": "Nickname",
>    "user2Id": "Another nickname"
>}
>```

>`blacklist` - A list with blacklisted words. If the message >includes any blacklisted word, the message will not be mirrored.  
> Usage example
>```json
>"blacklist": [
>    "word",
>    "word2",
>    "word3"
>]
>```

## FAQ
**Q: How can I get the channel id?**
> A: Right-click on the channel and click "Copy ID".

**Q: How can I get the account token?**
> A: You can get the token by pressing `Ctrl + Shift + I` in Discord, going to the "Network" tab, filter by "Fetch/XHR" and click on any successful request. The token will be in the "Request Headers" at the "Authorization" field.

**Q: Nothing happens when I run the script.**
> A: Make sure you have the correct permissions on both servers and the correct channel ids in the settings.json file. Also remember that the bot will not mirror messages from itself or other bots.

**Q: How can I run the script in the background?**
> A: You can use a process manager like PM2 to run the script in the background.

### Another questions? Feel free to open an issue.

## Contributing - bug fixes
Contributions are welcome! Please feel free to open an issue or submit a pull request, for bug fixes or new features.

1. Fork the repository
2. Create a new branch `git checkout -b <new-feature-name>`
3. Make the changes
4. Commit the changes `git commit -am "Add new feature"`
5. Push the changes `git push origin <new-feature-name>`
6. Create a pull request on GitHub

Many thanks!
