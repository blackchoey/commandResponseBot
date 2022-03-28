// Create HTTP server.
import { TeamsActivityHandler } from "botbuilder";
import * as restify from "restify";
import { adapter } from "./internal/initialize";
import * as path from "path";
import { TeamsSsoBot } from "./sso/teamsSsoBot";

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Process Teams activity with Bot Framework.
// const handler = new TeamsActivityHandler();
const handler = new TeamsSsoBot();

server.post("/api/messages", async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await handler.run(context);
    }).catch((err) => {
        // Error message including "412" means it is waiting for user's consent, which is a normal process of SSO, sholdn't throw this error.
        if (!err.message.includes("412")) {
            throw err;
        }
    });
});


server.get(
    "/auth-*.html",
    restify.plugins.serveStatic({
        directory: path.join(__dirname, "public"),
    })
);


