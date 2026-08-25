export interface CurrentUser {
  id?: number;

  uuid: string;
  username: string;
  primaryEmail: string;

  firstName: string | null;
  lastName: string | null;

  emailVerified: boolean;

  role?: string | null;
  roles?: string[];

  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

  lastLoginAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  avatarUrl?: string | null;
}
