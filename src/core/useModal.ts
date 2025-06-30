import {
  ActionRowBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Resolver, ResolverResult } from "../types/resolver";
import { Register } from "../types/register";

export interface UseModalParams<
  T extends Record<string, any> = Record<string, any>
> {
  id: string;
  title: string;
  resolver?: Resolver<T>;
  register?: Register;
}

export interface RegisterInputParams<T extends Record<string, any>> {
  id: keyof T;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
  paragraph?: boolean;
}

export function useModal<T extends Record<string, any>>(
  params: UseModalParams<T>
) {
  const modal = new ModalBuilder({
    custom_id: params.id,
    title: params.title,
  });

  if (params.register) params.register(modal);

  return {
    modal,
    parseResult: (interaction: ModalSubmitInteraction) => {
      const data = parseModalInteractionValues<T>(modal, interaction);
      if (!params.resolver) return { data, errors: {} } as ResolverResult<T>;
      return params.resolver(data);
    },
    register: (registerParams: RegisterInputParams<T>) =>
      registerInput(modal, registerParams),
  };
}

export function registerInput<T extends Record<string, any>>(
  modal: ModalBuilder,
  params: RegisterInputParams<T>
) {
  const input = new TextInputBuilder({
    custom_id: params.id as string,
    label: params.label,
    max_length: params.max,
    min_length: params.min,
    placeholder: params.placeholder,
    style: params.paragraph ? TextInputStyle.Paragraph : TextInputStyle.Short,
    required: params.required,
  });

  const row = new ActionRowBuilder<TextInputBuilder>().setComponents(input);
  modal.addComponents(row);
}

function parseModalInteractionValues<T>(
  modal: ModalBuilder,
  interaction: ModalSubmitInteraction
) {
  const data: Partial<T> = {};

  modal.components.forEach((row) => {
    const textInput = row.components[0];
    const isValidTextInput = textInput instanceof TextInputBuilder;
    if (!isValidTextInput) return;

    const propertyName = textInput.data.custom_id;
    if (!propertyName) return;

    const propertyValue = interaction.fields.getTextInputValue(propertyName);
    data[propertyName as keyof T] = propertyValue as T[keyof T];
  });

  return data as T;
}
