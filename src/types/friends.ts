export interface FriendDto {
  friendshipUuid: string;
  userUuid: string;
  username: string;
  defaultProfileUuid?: string | null;
  defaultProfileName?: string | null;
  avatarMediaKey?: string | null;
  avatarMediaUuid?: string | null;
  avatarUrl?: string | null;
  connectedAt?: string;
}

export interface FriendRequestDto {
  requestUuid: string;
  senderUuid?: string;
  senderUsername?: string;
  senderDefaultProfileName?: string | null;
  senderAvatarMediaKey?: string | null;
  senderAvatarMediaUuid?: string | null;
  senderAvatarUrl?: string | null;
  receiverUuid?: string;
  receiverUsername?: string;
  receiverDefaultProfileName?: string | null;
  receiverAvatarMediaKey?: string | null;
  receiverAvatarMediaUuid?: string | null;
  receiverAvatarUrl?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  createdAt?: string;
}

export interface FriendQrCodeResponse {
  qrCodeToken: string;
  userUuid?: string;
  username?: string;
  qrContent?: string;
}

export interface SendFriendRequestPayload {
  friendUsername?: string;
  friendUserUuid?: string;
  receiverUsername?: string;
  receiverUuid?: string;
}

export interface ScanFriendQrPayload {
  qrCodeToken: string;
}

export interface FriendActionResponse {
  success?: boolean;
  message?: string;
  payload?: unknown;
}
