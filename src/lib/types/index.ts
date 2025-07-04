export type User = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MessageWithUser = {
  id: string;
  text: string;
  sendBy: string;
  isEdit: boolean;
  createdAt: Date;
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};
