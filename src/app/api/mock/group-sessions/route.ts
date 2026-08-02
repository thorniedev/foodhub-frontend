import { NextResponse } from "next/server";

import { createMockGroupSession } from "@/lib/mock-group-session-store";
import type { CreateGroupSessionRequest } from "@/types/group-recommendation";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateGroupSessionRequest;

    const result = createMockGroupSession(body);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not create the voting session.",
      },
      {
        status: 400,
      },
    );
  }
}
