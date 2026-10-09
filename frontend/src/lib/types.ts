// TypeScript shapes of the JSON the backend returns. They mirror the Pydantic schemas.

export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_superhost: boolean;
  is_host: boolean;
};
