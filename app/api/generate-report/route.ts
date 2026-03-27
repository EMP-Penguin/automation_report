import { NextResponse } from "next/server";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
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

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "너는 형식 고정형 의학 참관보고서 작성기임. 지정된 항목만 출력하고 설명은 금지됨.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: getPromptByReportType(reportType, inputText),
            },
          ],
        },
      ],
    });

    const rawReport = response.output_text?.trim();

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
