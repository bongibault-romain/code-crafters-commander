import { Button } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ButtonBuilder, ButtonStyle, type ButtonInteraction, ChannelType, EmbedBuilder, ActionRowBuilder, OverwriteType } from "discord.js";
import config from "../../config";
import { CloseTicketButtonComponent } from "./closeTicket";

export class OpenTicketButtonComponent extends Button {
    constructor(client: ShewenyClient) {
        super(client, [OpenTicketButtonComponent.getId()]);
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

        const ticketChannelId = config.TICKETS_CATEGORY_ID;
        const ticketChannel = channel.guild.channels.resolve(ticketChannelId);

        if (!ticketChannel || ticketChannel.type !== ChannelType.GuildCategory) {
            await button.editReply({
                content: "The tickets category is not configured correctly.",
            })
            return;
        }

        const userId = channel.name.split('-')[1];

        await channel.edit({
            parent: ticketChannel,
            permissionOverwrites: [
                {
                    id: channel.guild.roles.everyone,
                    type: OverwriteType.Role,
                    deny: ["ViewChannel", "SendMessages", "ReadMessageHistory", "AddReactions", "AttachFiles"]
                },
                {
                    id: userId,
                    type: OverwriteType.Member,
                    allow: ["ViewChannel", "SendMessages", "ReadMessageHistory", "AddReactions", "AttachFiles"]
                }
            ]
        })

        const openEmbed = new EmbedBuilder()
            .setTitle("Ticket Opened")
            .setDescription(`Ticket Opened by <@${button.user.id}>`)
            .setColor([88, 101, 242])
            .setTimestamp();


        await button.editReply({
            content: "Ticket Opened",
        });
        await channel.send({
            embeds: [openEmbed],
            components: [
                new ActionRowBuilder().addComponents(CloseTicketButtonComponent.getMessageComponent()) as any
            ]
        })
    }

    public static getId(): string {
        return "openTicketButtonId";
    }

    public static getMessageComponent() {
        return new ButtonBuilder()
            .setCustomId(OpenTicketButtonComponent.getId())
            .setLabel("Open")
            .setStyle(ButtonStyle.Success)
            .setEmoji("🔓")
    }
};
