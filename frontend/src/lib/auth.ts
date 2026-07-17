"use client";

import { apiFetch } from "@/lib/api";

type RegisterUserResponse = {
  user: {
    id: number;
    email: string;
    username?: string | null;
    is_admin: boolean;
  };
  organization_id: number;
  organization_name: string;
  access_token: string;
  token_type: string;
  workspace_created: boolean;
};

export async function registerUser(email: string, password: string): Promise<RegisterUserResponse> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      username: email.split("@")[0],
    }),
  }) as Promise<RegisterUserResponse>;
}
