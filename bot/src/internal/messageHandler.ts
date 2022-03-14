// the same as .initialize

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CardFactory, TeamsActivityHandler, TurnContext } from "botbuilder";
import { adapter } from "./initialize";

class MessageHandler extends TeamsActivityHandler {
    constructor() {
        super();
    }

    // Messaging extension Code
    // Action.
    public async handleTeamsMessagingExtensionSubmitAction(
        context: TurnContext,
        action: any
    ): Promise<any> {
        switch (action.commandId) {
        case "createCard":
            return createCardCommand(context, action);
        case "shareMessage":
            return shareMessageCommand(context, action);
        default:
            throw new Error("NotImplemented");
        }
    }
}

async function createCardCommand(context: TurnContext, action: any): Promise<any> {
    // The user has chosen to create a card by choosing the 'Create Card' context menu command.
    const data = action.data;
    const heroCard = CardFactory.heroCard(data.title, data.text);
    heroCard.content.subtitle = data.subTitle;
    const attachment = {
        contentType: heroCard.contentType,
        content: heroCard.content,
        preview: heroCard,
    };

    return {
        composeExtension: {
            type: "result",
            attachmentLayout: "list",
            attachments: [attachment],
        },
    };
}

async function shareMessageCommand(context: TurnContext, action: any): Promise<any> {
    // The user has chosen to share a message by choosing the 'Share Message' context menu command.
    let userName = "unknown";
    if (
        action.messagePayload &&
        action.messagePayload.from &&
        action.messagePayload.from.user &&
        action.messagePayload.from.user.displayName
    ) {
        userName = action.messagePayload.from.user.displayName;
    }

    // This Messaging Extension example allows the user to check a box to include an image with the
    // shared message.  This demonstrates sending custom parameters along with the message payload.
    let images = [];
    const includeImage = action.data.includeImage;
    if (includeImage === "true") {
        images = [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU",
        ];
    }
    const heroCard = CardFactory.heroCard(
        `${userName} originally sent this message:`,
        action.messagePayload.body.content,
        images
    );

    if (
        action.messagePayload &&
        action.messagePayload.attachment &&
        action.messagePayload.attachments.length > 0
    ) {
        // This sample does not add the MessagePayload Attachments.  This is left as an
        // exercise for the user.
        heroCard.content.subtitle = `(${action.messagePayload.attachments.length} Attachments not included)`;
    }

    const attachment = {
        contentType: heroCard.contentType,
        content: heroCard.content,
        preview: heroCard,
    };

    return {
        composeExtension: {
            type: "result",
            attachmentLayout: "list",
            attachments: [attachment],
        },
    };
}
const handler = new MessageHandler();

//const handler = new TeamsActivityHandler();
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    await adapter.processActivity(req, context.res as any, async (context) => {
        await handler.run(context);
    });
};

export default httpTrigger;