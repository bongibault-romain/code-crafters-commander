import { Modal } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ModalBuilder, TextInputBuilder, type ModalSubmitInteraction, ActionRowBuilder, TextInputStyle, ChannelType, EmbedBuilder, ButtonBuilder, OverwriteType } from "discord.js";
import config from "../../config";
import { CloseTicketButtonComponent } from "../buttons/closeTicket";

export class OrderModalComponent extends Modal {
  constructor(client: ShewenyClient) {
    super(client, [OrderModalComponent.getId()]);
  }

  async execute(modal: ModalSubmitInteraction) {
    await modal.deferReply({
      ephemeral: true,
    })

    const guild = modal.guild;

    if (!guild) {
      await modal.editReply({
        content: "This command can only be used in a server.",
      });
      return;
    }

    const channel = guild.channels.resolve(config.TICKETS_CATEGORY_ID);

    if (!channel || channel.type !== ChannelType.GuildCategory) {
      await modal.editReply({
        content: "The ticket category does not exist.",
      });
      return;
    }

    const ticketChannel = await guild.channels.create({
      name: `ticket-${modal.user.id}`,
      permissionOverwrites: [
        {
          id: channel.guild.roles.everyone,
          type: OverwriteType.Role,
          deny: ["ViewChannel", "SendMessages", "ReadMessageHistory", "AddReactions", "AttachFiles"]
        },
        {
          id: modal.user.id,
          type: OverwriteType.Member,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory", "AddReactions", "AttachFiles"]
        }
      ],
      parent: channel
    })


    const ticketEmbed = new EmbedBuilder()
      .setTitle("Custom Minecraft Plugin Order")
      .setDescription(modal.fields.getTextInputValue('descriptionInput'))
      .addFields({
        name: "Version",
        value: modal.fields.getTextInputValue('versionInput'),
        inline: true
      })
      .addFields({
        name: "Budget",
        value: modal.fields.getTextInputValue('budgetInput'),
        inline: true
      })
      .setColor([88, 101, 242])
      .setTimestamp();

    const row = new ActionRowBuilder();

    row.addComponents(CloseTicketButtonComponent.getMessageComponent())

    await ticketChannel.send({
      embeds: [ticketEmbed],
      components: [row as any]
    })

    await modal.editReply({
      content: "Your order has been submitted. A staff member will be with you shortly.",
    })
  }

  public static getId(): string {
    return "orderModalId";
  }

  public static getMessageComponent() {
    const row1 = new ActionRowBuilder();

    const descriptionInput = new TextInputBuilder()
      .setCustomId("descriptionInput")
      .setPlaceholder("Enter a description of your plugin.")
      .setMinLength(100)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph)
      .setLabel("Description");

    const row2 = new ActionRowBuilder();

    const versionInput = new TextInputBuilder()
      .setCustomId("versionInput")
      .setPlaceholder("Enter the version of your server.")
      .setMinLength(1)
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setLabel("Version");

    const row3 = new ActionRowBuilder();

    const budgetInput = new TextInputBuilder()
      .setCustomId("budgetInput")
      .setPlaceholder("Enter your budget (specify the currency)")
      .setMinLength(1)
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setLabel("Budget");

    row1.addComponents(versionInput);
    row2.addComponents(descriptionInput);
    row3.addComponents(budgetInput);

    return new ModalBuilder()
      .setCustomId(OrderModalComponent.getId())
      .setTitle('Order Custom Minecraft Plugin')
      .addComponents(row1 as any, row2 as any, row3 as any)
  }
};
