export interface FriendDto {
  friendshipUuid: string;
  userUuid: string;
  username: string;
  defaultProfileUuid: string | null;
  defaultProfileName: string | null;
  avatarMediaKey: string | null;
  connectedAt: string;
}

export interface FriendRequestDto {
  requestUuid: string;
  senderUuid: string;
  senderUsername: string;
  senderDefaultProfileName: string | null;
  receiverUuid: string;
  receiverUsername: string;
  receiverDefaultProfileName: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  createdAt: string;
}

export interface FriendQrCodeResponse {
  qrCodeToken: string;
  userUuid: string;
  username: string;
  qrContent: string; // e.g. "foodhub://friends/add?token=fh_qr_xxx"
}

export interface SendFriendRequestPayload {
  receiverUsername?: string;
  receiverUuid?: string;
}

export interface ScanFriendQrPayload {
  qrCodeToken: string;
}

export interface FriendActionResponse {
  success: boolean;
  message?: string;
  payload?: unknown;
}
