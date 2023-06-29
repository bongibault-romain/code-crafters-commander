import { Button } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { OrderModalComponent } from "../modals/order";

export class OrderButtonComponent extends Button {
  constructor(client: ShewenyClient) {
    super(client, [OrderButtonComponent.getId()]);
  }

  async execute(button: ButtonInteraction) {
    await button.showModal(OrderModalComponent.getMessageComponent());
  }

  public static getId(): string {
    return "orderButtonId";
  }

  public static getMessageComponent() {
    return new ButtonBuilder()
      .setCustomId(OrderButtonComponent.getId())
      .setLabel("Order Now")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🛒")
  }
};
