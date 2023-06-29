import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";
import config from "../config";
import { GuildMember } from "discord.js";

export class GuildMemberAddEvent extends Event {
    constructor(client: ShewenyClient) {
        super(client, "guildMemberAdd", {
            description: "Event for when a member join the guild.",
            once: true,
            emitter: client,
        });
    }

    async execute(member: GuildMember) {
        const defaultRoleIds = config.DEFAULT_ROLE_IDS;
        await member.roles.add(defaultRoleIds);
    }
};
