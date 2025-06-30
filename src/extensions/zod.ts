import { ZodObject, ZodSchema } from "zod";
import { Resolver, ResolverResult } from "../types/resolver";
import { Register } from "../types/register";
import { registerInput } from "../core/useModal";

export function zodResolver<T extends Record<string, any>>(
  schema: ZodSchema<T>
): Resolver<T> {
  return (data) => {
    const result = schema.safeParse(data);
    if (result.success) return { data: data as T, errors: {} };

    const errors = Object.entries(result.error.flatten().fieldErrors).reduce(
      (acc, [key, values]) => ({
        ...acc,
        [key]: (values as Array<unknown>)[0],
      }),
      {}
    );

    return { data: null, errors } as ResolverResult<T>;
  };
}

export function zodRegister<T extends Record<string, any>>(
  schema: ZodObject<T>
): Register {
  return (modal) => {
    const shape = schema._def.shape();

    Object.entries(shape).forEach(([key, zodType]) => {
      let label =
        zodType._def?.description || key[0].toUpperCase() + key.slice(1);
      const isOptional = zodType.isOptional?.() ?? false;

      registerInput(modal, {
        id: key,
        label,
        required: !isOptional,
      });
    });
  };
}
