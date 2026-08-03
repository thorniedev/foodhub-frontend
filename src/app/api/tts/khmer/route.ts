import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type KhmerSpeechRequest = {
  text?: string;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getSpeechConfiguration() {
  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim().toLowerCase();

  const voice = process.env.AZURE_SPEECH_VOICE?.trim() || "km-KH-SreymomNeural";

  return {
    key,
    region,
    voice,
  };
}

/*
 * Open GET /api/tts/khmer in the browser.
 * It verifies the key, region and available Khmer voices.
 */
export async function GET() {
  const { key, region, voice } = getSpeechConfiguration();

  if (!key || !region) {
    return NextResponse.json(
      {
        success: false,
        message: "Azure Speech environment variables are missing.",
        configuration: {
          hasKey: Boolean(key),
          hasRegion: Boolean(region),
          selectedVoice: voice,
        },
      },
      {
        status: 500,
      },
    );
  }

  const voicesEndpoint =
    `https://${region}.tts.speech.microsoft.com` +
    "/cognitiveservices/voices/list";

  try {
    const response = await fetch(voicesEndpoint, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Azure voice-list request failed:", {
        status: response.status,
        statusText: response.statusText,
        region,
        endpoint: voicesEndpoint,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Azure rejected the Speech key or region.",
          azureStatus: response.status,
          azureStatusText: response.statusText,
          azureError: errorText,
          region,
          selectedVoice: voice,
        },
        {
          status: response.status,
        },
      );
    }

    const voices = (await response.json()) as Array<{
      ShortName?: string;
      Locale?: string;
      Gender?: string;
      DisplayName?: string;
    }>;

    const khmerVoices = voices
      .filter((item) => item.Locale?.toLowerCase() === "km-kh")
      .map((item) => ({
        name: item.ShortName,
        displayName: item.DisplayName,
        locale: item.Locale,
        gender: item.Gender,
      }));

    const selectedVoiceExists = khmerVoices.some((item) => item.name === voice);

    return NextResponse.json({
      success: true,
      message: "Azure Speech configuration works.",
      region,
      selectedVoice: voice,
      selectedVoiceExists,
      khmerVoices,
    });
  } catch (error) {
    console.error("Azure voice-list network error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not connect to Azure Speech.",
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  const { key, region, voice } = getSpeechConfiguration();

  try {
    if (!key || !region) {
      return NextResponse.json(
        {
          success: false,
          message: "Azure Speech is not configured.",
          configuration: {
            hasKey: Boolean(key),
            hasRegion: Boolean(region),
            selectedVoice: voice,
          },
        },
        {
          status: 500,
        },
      );
    }

    const body = (await request.json()) as KhmerSpeechRequest;

    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Speech text is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Speech text cannot exceed 500 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const endpoint =
      `https://${region}.tts.speech.microsoft.com` + "/cognitiveservices/v1";

    const ssml = [
      '<speak version="1.0"',
      ' xmlns="http://www.w3.org/2001/10/synthesis"',
      ' xml:lang="km-KH">',
      `<voice name="${voice}">`,
      `<prosody rate="-8%">`,
      escapeXml(text),
      "</prosody>",
      "</voice>",
      "</speak>",
    ].join("");

    const azureResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        Accept: "audio/mpeg",
        "User-Agent": "FoodHub",
      },
      body: ssml,
      cache: "no-store",
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();

      console.error("Azure Khmer TTS failed:", {
        status: azureResponse.status,
        statusText: azureResponse.statusText,
        region,
        voice,
        endpoint,
        azureError: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Could not generate Khmer speech.",
          azureStatus: azureResponse.status,
          azureStatusText: azureResponse.statusText,
          azureError:
            process.env.NODE_ENV === "development" ? errorText : undefined,
          region,
          voice,
        },
        {
          status: azureResponse.status,
        },
      );
    }

    const audioBuffer = await azureResponse.arrayBuffer();

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Azure returned an empty audio response.",
        },
        {
          status: 502,
        },
      );
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "private, max-age=300",
        "X-Speech-Voice": voice,
      },
    });
  } catch (error) {
    console.error("Khmer TTS route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not generate Khmer speech.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
