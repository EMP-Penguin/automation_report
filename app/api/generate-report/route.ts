import { NextResponse } from "next/server";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini";
import { getMasterSystemPrompt } from "@/lib/masterPrompt";
import { validateReportInput } from "@/lib/inputValidation";
import { getPromptByReportType } from "@/lib/prompts";
import { formatReport } from "@/lib/reportFormatter";
import { isReportType } from "@/lib/report-config";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reportType?: string;
      inputText?: string;
    };

    const reportType = body.reportType?.trim() ?? "";
    const inputText = body.inputText?.trim() ?? "";

    if (!isReportType(reportType)) {
      return NextResponse.json(
        { error: "유효한 보고서 종류를 선택해야 함" },
        { status: 400 },
      );
    }

    if (!inputText) {
      return NextResponse.json(
        { error: "의무기록 또는 필기를 입력해야 함" },
        { status: 400 },
      );
    }

    const validation = validateReportInput(reportType, inputText);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "정보가 충분하지 않습니다!",
          missingItems: validation.missingItems,
        },
        { status: 422 },
      );
    }

    const [client, systemInstruction] = await Promise.all([
      Promise.resolve(getGeminiClient()),
      getMasterSystemPrompt(),
    ]);

    const response = await client.models.generateContent({
      model: getGeminiModel(),
      contents: getPromptByReportType(reportType, inputText),
      config: {
        systemInstruction,
        responseMimeType: "text/plain",
      },
    });

    const rawReport = response.text?.trim();

    if (!rawReport) {
      return NextResponse.json(
        { error: "보고서 생성 결과가 비어 있음" },
        { status: 502 },
      );
    }

    const formattedReport = formatReport(reportType, rawReport);

    return NextResponse.json({ report: formattedReport });
  } catch (error) {
    console.error("generate-report error", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "보고서 생성 중 알 수 없는 오류가 발생했음",
      },
      { status: 500 },
    );
  }
}
