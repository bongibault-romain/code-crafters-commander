import { Button } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ButtonBuilder, ButtonStyle, type ButtonInteraction, ChannelType, EmbedBuilder, ActionRowBuilder, OverwriteType } from "discord.js";
import config from "../../config";
import { OpenTicketButtonComponent } from "./openTicket";
import { DeleteTicketButtonComponent } from "./deleteTicket";

export class CloseTicketButtonComponent extends Button {
    constructor(client: ShewenyClient) {
        super(client, [CloseTicketButtonComponent.getId()]);
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
                content: "This command can only be used in a ticket category.",
            })
            return;
        }

        if (channel.parentId !== config.TICKETS_CATEGORY_ID) {
            await button.editReply({
                content: "This command can only be used in a ticket category.",
            })
            return;
        }

        const archiveChannelId = config.ARCHIVE_CATEGORY_ID;
        const archiveChannel = channel.guild.channels.resolve(archiveChannelId);

        if (!archiveChannel || archiveChannel.type !== ChannelType.GuildCategory) {
            await button.editReply({
                content: "The archive category is not configured correctly.",
            })
            return;
        }

        const userId = channel.name.split('-')[1];

        await channel.edit({
            parent: archiveChannel,
            permissionOverwrites: [
                {
                    id: channel.guild.roles.everyone,
                    type: OverwriteType.Role,
                    deny: ["ViewChannel", "SendMessages", "ReadMessageHistory", "AddReactions", "AttachFiles"]
                },
                {
                    id: userId,
                    type: OverwriteType.Member,
                    deny: ["ViewChannel", "SendMessages", "ReadMessageHistory", "AddReactions", "AttachFiles"]
                }
            ]
        })

        const closeEmbed = new EmbedBuilder()
            .setTitle("Ticket Closed")
            .setDescription(`Ticket closed by <@${button.user.id}>`)
            .setColor([88, 101, 242])
            .setTimestamp();

        await button.editReply({
            content: "Ticket closed.",
        });
        await channel.send({
            embeds: [closeEmbed],
            components: [
                new ActionRowBuilder()
                    .addComponents(OpenTicketButtonComponent.getMessageComponent())
                    .addComponents(DeleteTicketButtonComponent.getMessageComponent()) as any
            ]
        })
    }

    public static getId(): string {
        return "closeTicketButtonId";
    }

    public static getMessageComponent() {
        return new ButtonBuilder()
            .setCustomId(CloseTicketButtonComponent.getId())
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔒")
    }
};
