import { TurnContext } from "botbuilder";

export interface TeamsFxCommandHandler {
    /**
     * The command name that trigger this handler.
     */
    commandName?: string;

    /**
     * The command name that trigger this handler.
     */
    commandTextPattern?: RegExp;

    /**
     * Handles a bot command received.
     * @param context The bot context.
     * @returns a string represent the reponse message or an adapative card payload object.
     */
    handleCommandReceived(context: TurnContext, commandText?: string): Promise<any>;
}