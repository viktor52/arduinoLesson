export type AdminUser = {
  id: string;
  username: string;
  displayName?: string | null;
  email: string;
  role: string;
  xp: number;
  level: number;
  completedAssignments: number;
  createdAt: string;
};
