import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type KhmerSpeechRequest = {
  text?: string;
  voice?: string;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getTTSConfiguration() {
  const kiriKey = process.env.KIRI_API_KEY?.trim();
  const kiriBaseUrl = (
    process.env.KIRI_API_BASE_URL?.trim() || "https://api.kiritts.com/v1"
  ).replace(/\/+$/, "");
  const kiriVoice = process.env.KIRI_VOICE?.trim() || "Maly";
  const kiriModel = process.env.KIRI_MODEL?.trim() || "kiritts";

  const azureKey = process.env.AZURE_SPEECH_KEY?.trim();
  const azureRegion = process.env.AZURE_SPEECH_REGION?.trim().toLowerCase();
  const azureVoice =
    process.env.AZURE_SPEECH_VOICE?.trim() || "km-KH-SreymomNeural";

  return {
    kiri: {
      hasKey: Boolean(kiriKey),
      key: kiriKey,
      baseUrl: kiriBaseUrl,
      voice: kiriVoice,
      model: kiriModel,
    },
    azure: {
      hasKey: Boolean(azureKey && azureRegion),
      key: azureKey,
      region: azureRegion,
      voice: azureVoice,
    },
  };
}

/*
 * GET /api/tts/khmer
 * Diagnostic endpoint to check configuration and list available voices.
 */
export async function GET() {
  const config = getTTSConfiguration();

  // Test Kiri TTS if key exists
  if (config.kiri.hasKey && config.kiri.key) {
    try {
      const response = await fetch(`${config.kiri.baseUrl}/voices`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.kiri.key}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          provider: "kiri",
          selectedVoice: config.kiri.voice,
          model: config.kiri.model,
          baseUrl: config.kiri.baseUrl,
          voices: data.data || [],
          fallbackConfigured: config.azure.hasKey,
        });
      }

      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          provider: "kiri",
          message: "Kiri TTS authentication check failed.",
          status: response.status,
          error: errorText,
          fallbackConfigured: config.azure.hasKey,
        },
        { status: response.status },
      );
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          provider: "kiri",
          message: "Could not reach Kiri TTS API.",
          error: err instanceof Error ? err.message : String(err),
        },
        { status: 500 },
      );
    }
  }

  // Fallback check: Azure Speech
  if (config.azure.hasKey && config.azure.key && config.azure.region) {
    return NextResponse.json({
      success: true,
      provider: "azure",
      region: config.azure.region,
      selectedVoice: config.azure.voice,
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: "No TTS provider configured. Set KIRI_API_KEY or AZURE_SPEECH_KEY.",
      configuration: {
        kiri: config.kiri.hasKey,
        azure: config.azure.hasKey,
      },
    },
    { status: 500 },
  );
}

/*
 * POST /api/tts/khmer
 * Synthesize Khmer speech and return MPEG audio stream.
 */
export async function POST(request: NextRequest) {
  const config = getTTSConfiguration();

  try {
    const body = (await request.json()) as KhmerSpeechRequest;
    const text = body.text?.trim();
    const requestedVoice = body.voice?.trim();

    if (!text) {
      return NextResponse.json(
        { success: false, message: "Speech text is required." },
        { status: 400 },
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Speech text cannot exceed 1000 characters." },
        { status: 400 },
      );
    }

    let kiriErrorDetails: string | null = null;

    // =========================================================================
    // 1. Primary Engine: Kiri TTS (https://api.kiritts.com/v1)
    // =========================================================================
    if (config.kiri.hasKey && config.kiri.key) {
      try {
        const kiriVoice = requestedVoice || config.kiri.voice;
        const endpoint = `${config.kiri.baseUrl}/audio/speech`;

        const kiriResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.kiri.key}`,
            "Content-Type": "application/json",
            Accept: "audio/mpeg, audio/*",
          },
          body: JSON.stringify({
            model: config.kiri.model,
            input: text,
            voice: kiriVoice,
            response_format: "mp3",
            speed: 1,
          }),
          cache: "no-store",
        });

        if (kiriResponse.ok) {
          const audioBuffer = await kiriResponse.arrayBuffer();

          if (audioBuffer.byteLength > 0) {
            return new NextResponse(audioBuffer, {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": String(audioBuffer.byteLength),
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
                "X-TTS-Provider": "kiri",
                "X-TTS-Voice": kiriVoice,
              },
            });
          }
        }

        kiriErrorDetails = await kiriResponse.text();
        console.warn("Kiri TTS request failed:", {
          status: kiriResponse.status,
          error: kiriErrorDetails,
        });
      } catch (kiriErr) {
        kiriErrorDetails =
          kiriErr instanceof Error ? kiriErr.message : String(kiriErr);
        console.error("Kiri TTS connection error:", kiriErr);
      }
    }

    // =========================================================================
    // 2. Fallback Engine: Azure Speech (if Kiri fails or not configured)
    // =========================================================================
    if (config.azure.hasKey && config.azure.key && config.azure.region) {
      try {
        const azureVoice = config.azure.voice;
        const endpoint =
          `https://${config.azure.region}.tts.speech.microsoft.com` +
          "/cognitiveservices/v1";

        const ssml = [
          '<speak version="1.0"',
          ' xmlns="http://www.w3.org/2001/10/synthesis"',
          ' xml:lang="km-KH">',
          `<voice name="${azureVoice}">`,
          `<prosody rate="-5%">`,
          escapeXml(text),
          "</prosody>",
          "</voice>",
          "</speak>",
        ].join("");

        const azureResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": config.azure.key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
            Accept: "audio/mpeg",
            "User-Agent": "FoodHub",
          },
          body: ssml,
          cache: "no-store",
        });

        if (azureResponse.ok) {
          const audioBuffer = await azureResponse.arrayBuffer();

          if (audioBuffer.byteLength > 0) {
            return new NextResponse(audioBuffer, {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": String(audioBuffer.byteLength),
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
                "X-TTS-Provider": "azure",
                "X-TTS-Voice": azureVoice,
              },
            });
          }
        }
      } catch (azureErr) {
        console.error("Azure TTS fallback error:", azureErr);
      }
    }

    // If both failed or Kiri returned plan/permission error
    return NextResponse.json(
      {
        success: false,
        message:
          "Could not generate Khmer speech. Please check your Kiri TTS plan on kiritts.com or configure Azure Speech.",
        kiriError: kiriErrorDetails,
        providerAttempted: config.kiri.hasKey ? "kiri" : "none",
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("Khmer TTS Route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error generating speech.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
