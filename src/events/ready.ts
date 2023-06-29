import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";
import config from "../config";
import { EmbedBuilder } from "@discordjs/builders";
import { OrderButtonComponent } from "../interactions/buttons/order";
import { ActionRowBuilder, ActionRowData, MessageActionRowComponentData } from "discord.js";

export class ReadyEvent extends Event {
  constructor(client: ShewenyClient) {
    super(client, "ready", {
      description: "Client is logged in",
      once: true,
      emitter: client,
    });
  }

  async execute() {
    console.log(`Logged in as ${this.client.user?.tag}!`);

    const guildId = config.CODE_CRAFTERS_GUILD_ID;
    const guild = this.client.guilds.resolve(guildId)

    if (!guild) {
      console.error(`Guild with ID ${guildId} was not found.`);
      return;
    }

    const orderChannelId = config.ORDER_CHANNEL_ID;
    const orderChannel = guild.channels.resolve(orderChannelId);

    if (!orderChannel || !orderChannel.isTextBased()) {
      console.error(`Channel with ID ${orderChannelId} was not found.`);
      return;
    }

    console.log(`Order channel is ${orderChannel.name}.`);

    const messages = await orderChannel.messages.fetch({ cache: false });
    for (const message of messages) {
      if (message[1].deletable)
        await message[1].delete();
    }

    const orderMessage = new EmbedBuilder()
      .setTitle("**👋 Welcome to Code Crafters - Custom Minecraft Plugins! 🚀✨**")
      .setDescription(`
      Looking to enhance your Minecraft server with custom Java plugins? Look no further! At Code Crafters, we craft tailor-made plugins that precisely cater to your needs. 🎮⚙️\n
      With our in-depth knowledge of Minecraft mechanics, we specialize in advanced features, PvP mechanics, and economy systems. Our goal: optimize performance and create a memorable gaming experience. ⚔️💰\n
      Collaboration is key. We work closely with you, the server owner, to align our plugins with your vision and goals. Together, let's bring your server to life! 🤝🌟\n
      Unlock your server's potential with Code Crafters. Order your custom Minecraft plugin today! 🎉🔧🌍
      `)
      .setColor([88, 101, 242]);

    const row = new ActionRowBuilder() as any;

    row.addComponents(OrderButtonComponent.getMessageComponent());

    await orderChannel.send({
      embeds: [orderMessage],
      components: [row]
    });
  }
};
