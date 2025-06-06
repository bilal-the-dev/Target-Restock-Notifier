import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export interface extendedAPICommand
  extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  permissionRequired?: bigint | Array<bigint>;
  guildOnly?: Boolean;
  autocomplete?(
    interaction: AutocompleteInteraction
  ): Promise<Array<ApplicationCommandOptionChoiceData | string>>;
  execute(interaction: ChatInputCommandInteraction): Promise<any>;
}

export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK";

export interface Monitor {
  id: string;
  name: string;
  channelId: string;
  targetURL: string;
  stockStatus: StockStatus;
}

export interface MonitorCreateOptions extends Omit<Monitor, "stockStatus"> {}
