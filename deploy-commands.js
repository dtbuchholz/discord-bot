import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import { parse, read, rigs } from "./commands/index.js";
dotenv.config();

// Set the environment variable as either `production` or `development`
const environment =
  process.env.NODE_ENV === "development" ? "development" : "production";
const isDevelopment = environment === "development";
// Define Discord bot variables
let token;
let clientId;
let guildId;
if (isDevelopment) {
  token = process.env.DEVELOPMENT_DISCORD_TOKEN;
  clientId = process.env.DEVELOPMENT_CLIENT_ID;
  guildId = process.env.DEVELOPMENT_GUILD_ID;
} else {
  token = process.env.DISCORD_TOKEN;
  clientId = process.env.CLIENT_ID;
}

// Add the SlashCommandBuilder#toJSON() output of each command's data for deployment
const commands = [read.data, parse.data, rigs.data];

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

// Install commands on Discord
(async () => {
  try {
    if (token === undefined || clientId === undefined)
      throw new Error("Discord token or client ID is undefined");
    // `rest.put()` method is assigned to `data` & used to refresh all commands with the current set
    let data;

    // `development` mode will update & install commands for *only* the guild defined at `guildId`
    if (isDevelopment) {
      if (guildId === undefined)
        throw new Error("Discord guild ID is undefined");

      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        {
          body: commands,
        }
      );
    } else {
      // `production` node env will update & install commands for all guilds
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );
      data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
    }

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
