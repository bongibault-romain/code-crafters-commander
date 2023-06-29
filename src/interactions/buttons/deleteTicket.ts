import { Button } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { OrderModalComponent } from "../modals/order";
import config from "../../config";

export class DeleteTicketButtonComponent extends Button {
    constructor(client: ShewenyClient) {
        super(client, [DeleteTicketButtonComponent.getId()]);
    }

    async execute(button: ButtonInteraction) {
        const channel = button.channel;
        await button.deferReply({
            ephemeral: true,
        });

        if (!button.member || !button.memberPermissions || !button.memberPermissions.has("ManageChannels")) {
            await button.editReply({
                content: "You do not have permission to use this button.",
            });
            return;
        }

        if (!channel || !channel.isTextBased() || channel.isDMBased()) {
            await button.editReply({
                content: "This command can only be used in a ticket channel.",
            })
            return;
        }

        if (channel.parentId !== config.ARCHIVE_CATEGORY_ID) {
            await button.editReply({
                content: "This command can only be used in a archive ticket category.",
            })
            return;
        }

        await channel.delete();
    }

    public static getId(): string {
        return "deleteTicketButtonId";
    }

    public static getMessageComponent() {
        return new ButtonBuilder()
            .setCustomId(DeleteTicketButtonComponent.getId())
            .setLabel("Delete")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")
    }
};
