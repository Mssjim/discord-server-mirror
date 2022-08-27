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
• Edit "settings.json" with your account token and channel ids.  
• Run `npm install` or `yarn install` to install dependencies. (You can also run the `setup.bat` file if you are on Windows)
• Run the bot with `npm start` or `yarn start`. (You can also run the `start.bat` file if you are on Windows) 

## Settings
You can edit the settings.json file with your personal preferences.

`readChannel` - The channel id where you read messages from.  
`writeChannel` - The channel id where you write messages to.  
`twoSided` - If true, messages will be mirrored between the two channels. If false, only messages from the read channel will be mirrored.  
`sendAttachments` - If true, attachments will be sent. If false, attachments will be ignored, and only text will be sent.  
`convertEmojis` - If true, emojis will be converted to target server emojis. If false, emojis will not be converted (This is useful if account has nitro enabled).  
`showAuthor` - If true, the message will contain the author tag and id. If false, will send only the message content.  
`typing` - If true, the self will simulate the message typing time before sending.  
`tokens` - An array of account tokens. You need to have at least one token.  
Multiple tokens can be separated by commas:
```json
{
  "tokens": [
    "token1",
    "token2",
    "token3"
  ],
}
```

Make sure all accounts are joined on both servers and have necessary permissions.

## Contributing - bug fixes
Contributions are welcome! Please feel free to open an issue or submit a pull request, for bug fixes or new features.

1. Fork the repository
2. Create a new branch `git checkout -b <new-feature-name>`
3. Make the changes
4. Commit the changes `git commit -am "Add new feature"`
5. Push the changes `git push origin <new-feature-name>`
6. Create a pull request on GitHub

Many thanks!
