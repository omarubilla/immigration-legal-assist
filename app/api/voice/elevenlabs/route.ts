import { NextResponse } from "next/server";

type TtsRequestBody = {
  text?: string;
  lang?: string;
  context?: "chat" | "consultation";
};

function getVoiceId(lang: string) {
  if (lang === "es") {
    return process.env.ELEVENLABS_VOICE_ID_ES || process.env.ELEVENLABS_VOICE_ID;
  }

  return process.env.ELEVENLABS_VOICE_ID;
}

function getFallbackVoiceId(lang: string) {
  if (lang === "es") {
    return process.env.ELEVENLABS_FALLBACK_VOICE_ID_ES || process.env.ELEVENLABS_FALLBACK_VOICE_ID;
  }

  return process.env.ELEVENLABS_FALLBACK_VOICE_ID;
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "ElevenLabs is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as TtsRequestBody;
  const text = body.text?.trim();
  const lang = body.lang?.trim() || "es";
  const context = body.context === "chat" ? "chat" : "consultation";
  const voiceId = getVoiceId(lang);
  const fallbackVoiceId = getFallbackVoiceId(lang);

  if (!voiceId) {
    return NextResponse.json({ error: "Missing ElevenLabs voice ID" }, { status: 503 });
  }

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const payload = {
    text,
    model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    voice_settings:
      context === "consultation"
        ? {
            stability: 0.55,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          }
        : {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.1,
            use_speaker_boost: true,
          },
  };

  const callElevenLabs = async (selectedVoiceId: string) =>
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

  let selectedVoiceId = voiceId;
  let response = await callElevenLabs(selectedVoiceId);
  let errorText = response.ok ? null : await response.text();

  const shouldFallback =
    !response.ok &&
    Boolean(fallbackVoiceId) &&
    fallbackVoiceId !== selectedVoiceId &&
    errorText?.includes("paid_plan_required");

  if (shouldFallback && fallbackVoiceId) {
    selectedVoiceId = fallbackVoiceId;
    response = await callElevenLabs(selectedVoiceId);
    errorText = response.ok ? null : await response.text();
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "ElevenLabs request failed",
        details: errorText,
      },
      { status: 502 },
    );
  }

  const audioBuffer = await response.arrayBuffer();

  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-ElevenLabs-Voice-Id": selectedVoiceId,
    },
  });
}