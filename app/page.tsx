"use client";

import { useState } from "react";
import { InputArea } from "@/components/InputArea";
import { OutputCard } from "@/components/OutputCard";
import { ReportSelector } from "@/components/ReportSelector";
import { TemplateViewer } from "@/components/TemplateViewer";
import { type ReportType } from "@/lib/report-config";

type ApiResponse = {
  report?: string;
  error?: string;
  missingItems?: string[];
};

export default function HomePage() {
  const [isTypePanelOpen, setIsTypePanelOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(
    null,
  );
  const [inputText, setInputText] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [error, setError] = useState("");
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateReport() {
    if (!selectedReportType) {
      setError("보고서 종류를 먼저 선택해야 함");
      setMissingItems([]);
      setGeneratedReport("");
      return;
    }

    if (!inputText.trim()) {
      setError("의무기록 또는 필기를 입력해야 함");
      setMissingItems([]);
      setGeneratedReport("");
      return;
    }

    setIsLoading(true);
    setError("");
    setMissingItems([]);
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
        setMissingItems(data.missingItems || []);
        throw new Error(data.error || "보고서 생성에 실패했음");
      }

      setMissingItems([]);
      setGeneratedReport(data.report || "");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "보고서 생성 중 오류가 발생했음",
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
      setError("복사에 실패했음");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Observation Report Generator</p>
        <h1>자동 참관보고서 생성기</h1>
        <p className="hero-copy">
          EMR 또는 학생 필기를 입력하면 서버에서 LLM을 호출해 지정된 양식의
          참관보고서를 생성함
        </p>

        <ReportSelector
          isOpen={isTypePanelOpen}
          selectedReportType={selectedReportType}
          onToggle={() => setIsTypePanelOpen((prev) => !prev)}
          onSelect={(type) => {
            setSelectedReportType(type);
            setError("");
            setIsTemplateOpen(false);
          }}
        />

        {selectedReportType ? (
          <div className="workspace-grid">
            <section className="input-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">선택된 보고서</p>
                  <h2>{selectedReportType}</h2>
                </div>
              </div>

              <TemplateViewer
                reportType={selectedReportType}
                isOpen={isTemplateOpen}
                onToggle={() => setIsTemplateOpen((prev) => !prev)}
              />

              <InputArea
                value={inputText}
                onChange={setInputText}
                onSubmit={handleGenerateReport}
                disabled={isLoading}
              />
            </section>

            <OutputCard
              report={generatedReport}
              error={error}
              missingItems={missingItems}
              isLoading={isLoading}
              copied={copied}
              onCopy={handleCopy}
            />
          </div>
        ) : (
          <div className="empty-selection">
            <p>먼저 보고서 종류를 선택하면 입력 영역과 양식 확인 기능이 열림</p>
          </div>
        )}
      </section>
    </main>
  );
}
