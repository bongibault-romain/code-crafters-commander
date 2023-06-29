import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import config from "../config";

export class AnnouncementCommand extends Command {
    constructor(client: ShewenyClient) {
        super(client, {
            name: "announcement",
            description: "Create an announcement.",
            type: "SLASH_COMMAND",
            category: "Staff",
            cooldown: 3,
            options: [
                {
                    name: "title",
                    description: "The title of the announcement.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "description",
                    description: "The description of the announcement.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
            userPermissions: ["ManageGuild"],
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.editReply({
                content: "This command can only be used in a guild.",
            });
            return;
        }

        const announcementChannelId = config.ANNOUCEMENTS_CHANNEL_ID;
        const announcementChannel = interaction.guild.channels.resolve(announcementChannelId);

        if (!announcementChannel || !announcementChannel.isTextBased()) {
            await interaction.editReply({
                content: "The announcements channel is not configured correctly.",
            });
            return;
        }

        const title = interaction.options.get("title")?.value as string;
        const description = interaction.options.get("description")?.value as string;

        const embed = new EmbedBuilder()
            .setColor([88, 101, 242])
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()

        await announcementChannel.send({ embeds: [embed], content: "@everyone" });
        await interaction.editReply({
            content: "The announcement has been sent.",
        });
    }
}
