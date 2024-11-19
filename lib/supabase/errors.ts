export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromError(error: unknown): SupabaseError {
    if (error instanceof SupabaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new SupabaseError(error.message);
    }

    return new SupabaseError('An unknown error occurred');
  }
}

export function handleSupabaseError(error: unknown): never {
  throw SupabaseError.fromError(error);
}