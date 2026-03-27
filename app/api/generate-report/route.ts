import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  REPORT_TEMPLATES,
  REPORT_TYPES,
  isReportType,
  type ReportType,
} from "@/lib/report-config";

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

function buildPrompt(reportType: ReportType, inputText: string) {
  const selectedTemplate = REPORT_TEMPLATES[reportType];
  const allTypes = REPORT_TYPES.join(", ");

  return `당신은 의료/임상 참관보고서를 정리하는 조교입니다.

목표:
- 아래 입력된 의무기록 또는 학생 필기를 바탕으로 "${reportType}"를 한국어로 작성합니다.
- 사실 관계는 입력 내용에 기반해야 하며, 없는 내용은 단정하지 말고 필요한 경우 "기록상 확인되지 않음"처럼 표기합니다.
- 문장은 자연스럽고 공식적인 보고서 문체로 작성합니다.
- 민감정보는 입력에 없는 경우 임의로 추가하지 않습니다.

가능한 보고서 종류: ${allTypes}

선택된 보고서 유형 작성 가이드:
${selectedTemplate.guidance}

반드시 아래 양식 구조를 따르되, 입력 내용에 맞게 항목명을 조금 다듬어도 됩니다.
${selectedTemplate.template}

입력 원문:
"""
${inputText}
"""`;
}

export async function POST(request: Request) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      reportType?: string;
      inputText?: string;
    };

    const reportType = body.reportType?.trim() ?? "";
    const inputText = body.inputText?.trim() ?? "";

    if (!isReportType(reportType)) {
      return NextResponse.json(
        { error: "유효한 보고서 종류를 선택하세요." },
        { status: 400 },
      );
    }

    if (!inputText) {
      return NextResponse.json(
        { error: "입력 텍스트를 작성하세요." },
        { status: 400 },
      );
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "당신은 의료 교육 현장의 참관보고서를 정확하고 구조적으로 작성하는 한국어 전문 작성 도우미입니다.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt(reportType, inputText),
            },
          ],
        },
      ],
    });

    const outputText = response.output_text?.trim();

    if (!outputText) {
      return NextResponse.json(
        { error: "보고서 생성 결과가 비어 있습니다." },
        { status: 502 },
      );
    }

    return NextResponse.json({ report: outputText });
  } catch (error) {
    console.error("generate-report error", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "보고서 생성 중 알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
