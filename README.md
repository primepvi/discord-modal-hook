# discord-modal-hook

> ⚡ Inspired by [react-hook-form](https://react-hook-form.com)

A lightweight utility to create and manage Discord modals with `discord.js`.  
Register fields manually or extend with [Zod](https://zod.dev) for powerful
validation.

---

## Documentation

- [Features](#-features)
- [Installation](#-installation)
- [Basic Usage (Manual)](#basic-usage-manual)
- [Zod Validation](#zod-validation)
- [API Overview](#api-overview)

---

## ✨ Features

- Clean modal creation with `discord.js`
- Manual and schema-based input registration
- Simple data parsing and validation
- Optional Zod integration for type-safe validation

---

## 📦 Installation

```bash
npm install discord-modal-hook
```

## Basic Usage (Manual)

Manual input registration is the default and most flexible usage.

```js
import { useModal } from "discord-modal-hook";

const { modal, register, parseResult } = useModal({
  id: "userForm",
  title: "User Information",
});

register({ id: "name", label: "Name", required: true });
register({ id: "age", label: "Age", required: true });

await interaction.showModal(modal);
```

Handling modal submission:

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== "userForm")
    return;

  const { data } = parseResult(interaction);

  await interaction.reply({
    content: `Hello ${data.name}, you are ${data.age} years old.`,
    ephemeral: true,
  });
});
```

## Zod Validation

You can use **Zod** to automatically register fields and validate input.

```js
import { z } from "zod";
import { useModal } from "discord-modal-hook";
import { zodRegister, zodResolver } from "discord-modal-hook/extensions/zod";

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .describe("Your Name"), // for modal label
  age: z.coerce
    .number()
    .min(1, "Age must be a valid number.")
    .describe("Your Age"), // for modal label,
});

const { modal, parseResult } = useModal({
  id: "zodForm",
  title: "Zod Validation Form",
  register: zodRegister(schema),
  resolver: zodResolver(schema),
});

await interaction.showModal(modal);
```

Handling validation errors:

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== "zodForm")
    return;

  const { data, errors } = parseResult(interaction);

  if (data) {
    await interaction.reply({
      content: `✅ Success! Name: ${data.name}, Age: ${data.age}`,
      ephemeral: true,
    });
  } else {
    const errorMessage = errors.name || errors.age;

    await interaction.reply({
      content: `❌ Validation Error:\n${errorMessage}`,
      ephemeral: true,
    });
  }
});
```

## API Overview

#### `useModal<T>(options): UseModalResult<T>;`

Creates a modal and returns tools to register inputs and parse results.

> ###### `UseModalParams<T>`

```ts
{
  id: string; // Modal custom id
  title: string; // Modal title
  register?: Register; // Optional field auto-registration (e.g. from Zod)
  resolver?: Resolver<T>; // Optional validation logic (e.g. from Zod)
}
```

> ###### `UseModalResult<T>`

```ts
{
    modal: ModalBuilder; // a ready-to-show ModalBuilder
    register: (params) => void; // registers a single input manually
    parseResult(interaction) => T; // parses and optionally validates submitted values
}
```

#### `register<T>(params: RegisterInputParams<T>): void`

Registers a single input manually into the modal.

> ###### `RegisterInputParams<T>`

```ts
{
    id: keyof T; // Key used in result object
    label: string; // Visible label on the modal
    placeholder?: string; // Placeholder text
    min?: number; // Minimum input length
    max?: number; // Maximum input length
    required?: boolean; // Is the field required
    paragraph?: boolean; // Uses multiline input(TextInputStyle.Paragraph)
}
```

#### `parseResult(interaction): ResolverResult<T>`

Parses submitted modal data, returning it as an object typed as T. If a resolver
was passed, it also validates the data.

###### `ResolverResult<T>`

```ts
{
  data: T | null;
  errors: Partial<Record<keyof T, string>>;
}
```
