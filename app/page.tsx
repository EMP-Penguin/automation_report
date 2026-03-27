"use client";

import { useState } from "react";
import {
  REPORT_TEMPLATES,
  REPORT_TYPES,
  type ReportType,
} from "@/lib/report-config";

type ApiResponse = {
  report?: string;
  error?: string;
};

export default function HomePage() {
  const [isTypePanelOpen, setIsTypePanelOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(
    null,
  );
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedTemplate = selectedReportType
    ? REPORT_TEMPLATES[selectedReportType]
    : null;

  async function handleGenerateReport() {
    if (!selectedReportType) {
      setError("보고서 종류를 먼저 선택하세요.");
      setGeneratedReport("");
      return;
    }

    if (!inputText.trim()) {
      setError("의무기록 또는 필기를 입력하세요.");
      setGeneratedReport("");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedReport("");
    setCopied(false);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType: selectedReportType,
          inputText,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "보고서 생성에 실패했습니다.");
      }

      setGeneratedReport(data.report || "");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "보고서 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!generatedReport) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedReport);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("클립보드 복사에 실패했습니다.");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Clinical / Observation Report Builder</p>
        <h1>자동 참관보고서 생성기</h1>
        <p className="hero-copy">
          의무기록(EMR)이나 학생 필기를 붙여 넣으면 선택한 양식에 맞춰
          참관보고서를 자동으로 정리합니다.
        </p>

        <div className="section-block">
          <button
            type="button"
            className="toggle-trigger"
            onClick={() => setIsTypePanelOpen((prev) => !prev)}
            aria-expanded={isTypePanelOpen}
          >
            보고서 종류 선택
          </button>

          {isTypePanelOpen ? (
            <div className="pill-panel" role="list" aria-label="보고서 종류 목록">
              {REPORT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`pill-button ${
                    selectedReportType === type ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedReportType(type);
                    setError("");
                    setIsTemplateOpen(false);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {selectedReportType ? (
          <div className="workspace-grid">
            <section className="input-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">선택된 보고서</p>
                  <h2>{selectedReportType}</h2>
                </div>

                <button
                  type="button"
                  className="template-toggle"
                  onClick={() => setIsTemplateOpen((prev) => !prev)}
                  aria-expanded={isTemplateOpen}
                >
                  보고서 양식 확인
                </button>
              </div>

              {isTemplateOpen && selectedTemplate ? (
                <div className="template-box">
                  <p className="template-guidance">{selectedTemplate.guidance}</p>
                  <pre>{selectedTemplate.template}</pre>
                </div>
              ) : null}

              <label className="input-label" htmlFor="report-input">
                관찰 기록 입력
              </label>
              <textarea
                id="report-input"
                className="report-textarea"
                placeholder="의무기록/필기를 입력하세요..."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />

              <div className="action-row">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                >
                  {isLoading ? "생성 중..." : "입력 완료"}
                </button>
              </div>
            </section>

            <section className="output-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">출력 결과</p>
                  <h2>생성된 참관보고서</h2>
                </div>

                <button
                  type="button"
                  className="copy-button"
                  onClick={handleCopy}
                  disabled={!generatedReport}
                >
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>

              {isLoading ? (
                <div className="status-card loading-card">
                  <div className="spinner" aria-hidden="true" />
                  <p>입력 내용을 분석하고 보고서를 생성하고 있습니다.</p>
                </div>
              ) : null}

              {!isLoading && error ? (
                <div className="status-card error-card">
                  <p>{error}</p>
                </div>
              ) : null}

              {!isLoading && !error && generatedReport ? (
                <article className="report-card">
                  <pre>{generatedReport}</pre>
                </article>
              ) : null}

              {!isLoading && !error && !generatedReport ? (
                <div className="empty-card">
                  <p>
                    보고서 종류를 선택하고 기록을 입력한 뒤 `입력 완료`를 누르면
                    이 영역에 결과가 표시됩니다.
                  </p>
                </div>
              ) : null}
            </section>
          </div>
        ) : (
          <div className="empty-selection">
            <p>먼저 보고서 종류를 선택하면 입력 영역과 양식 확인 기능이 열립니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
