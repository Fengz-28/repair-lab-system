export type LocalStaffSession = {
  userId: string | null;
  role: "admin" | "staff";
  mode: "local-placeholder";
};

export async function requireLocalStaff(): Promise<LocalStaffSession> {
  return {
    userId: null,
    role: "admin",
    mode: "local-placeholder",
  };
}

