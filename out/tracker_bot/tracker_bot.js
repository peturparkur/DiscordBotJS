import { BaseDiscordBot } from "../base_bot/bot.js";
import { config } from "dotenv"; //used only for getting API KEYS
import { CommandConstructor } from "../discord_utils/comm_class.js";
import * as commands from "./commands/commands.js";
// invite link: https://discord.com/api/oauth2/authorize?client_id=927973931359539320&permissions=8&scope=bot
config();
class TrackerBot extends BaseDiscordBot {
    Setup() {
        super.Setup();
        //commands.tracker.Start(this)
        commands.tracker2.Start(this);
        console.log("Tracker is started");
        this.on('ready', () => {
            console.log('Called Username change');
            this.user.setUsername('GameLeaderboards');
        });
    }
}
const tracker = new TrackerBot(".");
tracker.AddCommands([['time', commands.CmdTime],
    ['playtime', commands.CmdCheckPlaytime2],
    ['check', commands.CmdCheckPlaytime2],
    ['top', commands.CmdCheckTopPlaytime],
    ['leaderboard', commands.CmdCheckTopPlaytime],
    ['global', commands.CmdCheckGlobalTopPlaytime],
    ['invite', CommandConstructor((client, message, ...content) => message.channel.send('https://discord.com/api/oauth2/authorize?client_id=927973931359539320&permissions=8&scope=bot'), "Invite Link for bot", [])]
]);
tracker.Start(process.env.TRACKER_TOKEN); // load into PlayTrackerBot
// tracker.Start(process.env.TOKEN)
