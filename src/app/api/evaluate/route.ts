import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/evaluate
 * Server-side Gemini evaluation endpoint.
 * Keeps API key secure (never exposed to client).
 *
 * Body: { keyword: string, imageBase64: string }
 * Response: { match: boolean, score: number, comment: string }
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback: mock evaluation when no API key configured
    console.log("[evaluate] No GEMINI_API_KEY set, using mock");
    console.warn("GEMINI_API_KEY not set, using mock evaluation");
    const mockScore = 5 + Math.random() * 5;
    return NextResponse.json({
      match: true,
      score: Math.round(mockScore * 10) / 10,
      comment: "선생님이 바빠서 대충 채점했습니다. (Gemini API 키가 없어서 모의 평가)",
    });
  }

  try {
    const { keyword, imageBase64 } = await request.json();

    if (!keyword || !imageBase64) {
      return NextResponse.json(
        { error: "keyword and imageBase64 are required" },
        { status: 400 }
      );
    }

    console.log(`[evaluate] Gemini call: keyword="${keyword}", image size=${imageBase64.length} chars`);

    // Check for blank canvas (very small base64 = likely empty)
    if (imageBase64.length < 500) {
      return NextResponse.json({
        match: false,
        score: 0,
        comment: "빈 캔버스입니다. 뭐라도 그려주세요!",
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `키워드는 '${keyword}'입니다. 이 이미지가 ${keyword}를 나타내나요?
가독성/정확도/창의성을 기준으로 10점 만점 평가해주세요.
JSON으로만 응답: {"match": true/false, "score": 0-10, "comment": "한국어 한줄 평가"}
빈 이미지나 의미 없는 낙서는 score 0으로 평가하세요.`,
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[evaluate] Gemini API error:", response.status, errBody);
      return NextResponse.json({
        match: true,
        score: 5,
        comment: "선생님이 바빠서 채점 못했습니다. (API 오류)",
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("[evaluate] Gemini raw response:", text?.substring(0, 200));

    if (!text) {
      console.warn("[evaluate] No text in Gemini response");
      return NextResponse.json({
        match: true,
        score: 5,
        comment: "선생님이 바빠서 채점 못했습니다. (응답 없음)",
      });
    }

    try {
      const result = JSON.parse(text);
      const score = Math.min(10, Math.max(0, Number(result.score) || 5));
      const comment = String(result.comment || "평가 완료");
      console.log(`[evaluate] Score: ${score}, Comment: ${comment}`);

      return NextResponse.json({
        match: Boolean(result.match),
        score,
        comment,
      });
    } catch (parseErr) {
      console.error("[evaluate] JSON parse error:", parseErr, "raw:", text);
      return NextResponse.json({
        match: true,
        score: 5,
        comment: "선생님이 바빠서 채점 못했습니다. (파싱 오류)",
      });
    }
  } catch (error) {
    console.error("Evaluation error:", error);
    // Auto-pass on any error
    return NextResponse.json({
      match: true,
      score: 5,
      comment: "선생님이 바빠서 채점 못했습니다.",
    });
  }
}
