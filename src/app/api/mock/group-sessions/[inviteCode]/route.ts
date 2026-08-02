import { NextResponse } from "next/server";

import {
  finishMockGroupVoting,
  getMockGroupSession,
  joinMockGroupSession,
  submitMockGroupVote,
} from "@/lib/mock-group-session-store";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    inviteCode: string;
  }>;
}

type SessionActionRequest =
  | {
      action: "join";
      name: string;
    }
  | {
      action: "vote";
      participantToken: string;
      storeUuid: string;
    }
  | {
      action: "finish";
      ownerToken: string;
    };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { inviteCode } = await context.params;
  const session = getMockGroupSession(inviteCode);

  if (!session) {
    return NextResponse.json(
      {
        message: "Voting session not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(session, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { inviteCode } = await context.params;
    const body = (await request.json()) as SessionActionRequest;

    switch (body.action) {
      case "join": {
        const result = joinMockGroupSession(inviteCode, body.name);

        return NextResponse.json(result);
      }

      case "vote": {
        const session = submitMockGroupVote(
          inviteCode,
          body.participantToken,
          body.storeUuid,
        );

        return NextResponse.json(session);
      }

      case "finish": {
        const session = finishMockGroupVoting(inviteCode, body.ownerToken);

        return NextResponse.json(session);
      }

      default: {
        return NextResponse.json(
          {
            message: "Unsupported session action.",
          },
          {
            status: 400,
          },
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "The voting action failed.",
      },
      {
        status: 400,
      },
    );
  }
}
