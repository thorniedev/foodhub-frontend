export interface CurrentUser {
  id?: number;
  uuid: string;
  username: string;
  primaryEmail: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
}
