import users from "@/data/users.json";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResult = {
  ok: boolean;
  message: string;
  user?: { id: number; email: string; name: string };
};

/**
 * Static JSON authentication for UI development.
 * Replace the body of this function with fetch('/api/auth/login', ...)
 * when your backend is ready.
 */
export async function loginWithJson(payload: LoginPayload): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const user = users.find(
    (item) => item.email === payload.email && item.password === payload.password,
  );

  if (!user) {
    return { ok: false, message: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ" };
  }

  return {
    ok: true,
    message: "ចូលគណនីបានជោគជ័យ",
    user: { id: user.id, email: user.email, name: user.name },
  };
}
