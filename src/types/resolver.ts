export type ResolverResult<T extends Record<string, any>> =
  | {
      data: T;
      errors: Partial<Record<keyof T, string>>;
    }
  | {
      data: null;
      errors: Partial<Record<keyof T, string>>;
    };

export type Resolver<T extends Record<string, any>> = (
  data: Record<string, any>
) => ResolverResult<T>;
