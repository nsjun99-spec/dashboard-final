"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  UploadCloud,
  Database,
  Search,
  Plus,
  FolderOpen,
  Building2,
  CalendarRange,
  Info,
  PencilLine,
  Table2
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { key: "upload", label: "데이터 업로드", icon: UploadCloud },
  { key: "validation", label: "검증 및 매핑", icon: ShieldCheck },
  { key: "reports", label: "보고서 생성", icon: FileSpreadsheet },
  { key: "settings", label: "운영 설정", icon: Settings2 },
];

const statusTone: Record<string, string> = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  neutral: "bg-blue-50 text-blue-700 border-blue-200",
};

const months = ["2026-03", "2026-02", "2026-01"];

const uploadTemplates = [
  { key: "bs", type: "재무상태표", file: "BS_2026-03.xlsx", total: 182, success: 182, failed: 0, status: "ready", helper: "재무상태표 원천 파일을 업로드합니다." },
  { key: "pl", type: "손익계산서", file: "PL_2026-03.xlsx", total: 214, success: 212, failed: 2, status: "warning", helper: "손익계산서 원천 파일을 업로드합니다." },
  { key: "lng_volume", type: "LNG매출 부피", file: "LNG_VOLUME_2026-03.xlsx", total: 98, success: 95, failed: 3, status: "warning", helper: "LNG 매출 부피 파일을 독립적으로 업로드합니다." },
  { key: "lng_heat", type: "LNG매출 열량", file: "LNG_HEAT_2026-03.xlsx", total: 98, success: 98, failed: 0, status: "ready", helper: "LNG 매출 열량 파일을 독립적으로 업로드합니다." }
] as const;

const validationRows = [
  { item: "매출액", source: "PL", mapped: "손익계산서 > 매출", value: "12,480,000,000", mom: "+8.4%", yoy: "+5.2%", issue: "정상", level: "ready" },
  { item: "영업이익", source: "PL", mapped: "손익계산서 > 영업이익", value: "1,920,000,000", mom: "+3.1%", yoy: "+2.6%", issue: "정상", level: "ready" },
  { item: "LNG 판매량", source: "매출명세서", mapped: "영업보고 > 판매량", value: "184,220", mom: "+31.2%", yoy: "+14.1%", issue: "급격한 증가", level: "warning" },
  { item: "지급수수료", source: "PL", mapped: "미매핑", value: "-", mom: "-", yoy: "-", issue: "매핑 필요", level: "warning" },
  { item: "감가상각비", source: "PL", mapped: "손익계산서 > 감가상각비", value: "880,000,000", mom: "-18.7%", yoy: "-2.1%", issue: "감소 원인 확인", level: "warning" },
] as const;

const mappingRules = [
  { sourceType: "PL", accountCode: "410100", accountName: "매출액", target: "실적보고서.sales", formula: "SUM", priority: 1 },
  { sourceType: "PL", accountCode: "520300", accountName: "영업이익", target: "실적보고서.operatingProfit", formula: "DIRECT", priority: 1 },
  { sourceType: "SALES", accountCode: "LNG_VOL", accountName: "LNG매출 부피", target: "영업보고.salesVolume", formula: "SUM", priority: 2 },
] as const;

const monthlyRows = [
  { major: "판매량", detail: "가 정 용", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "영 업 무 용", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "산 업 용", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "수 송 용", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "열 병 합 용", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "연 료 전 지", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "합     계", detail: "", current: null, previous: null, diff: null, note: "", level: "total" },
  { major: "기타판매량", detail: "", current: null, previous: null, diff: null, note: "", level: "section" },
  { major: "매   출   액", detail: "", current: null, previous: null, diff: null, note: "", level: "section" },
  { major: "매출총이익", detail: "도시가스 판매량이익", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "도시가스 기타판매량", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "도시가스 기타매출총익", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "기타총이익(신규사업, 집단E)", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "소     계", detail: "", current: null, previous: null, diff: null, note: "", level: "total" },
  { major: "판관비", detail: "급여", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "상여", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "제수당", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "퇴직급여/장기종업원급여", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "인건비 소계", current: null, previous: null, diff: null, note: "", level: "subtotal" },
  { major: "", detail: "고객센터(LSC)", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "SLA / IT", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "콜센터 / 티센터", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "기타지급수수료", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "수수료 소계", current: null, previous: null, diff: null, note: "", level: "subtotal" },
  { major: "", detail: "감가상각비", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "복리후생비", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "세금과공과", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "기타판관비", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "기타 소계", current: null, previous: null, diff: null, note: "", level: "subtotal" },
  { major: "", detail: "전체 판관비 소계", current: null, previous: null, diff: null, note: "", level: "total" },
  { major: "영 업 이 익", detail: "", current: null, previous: null, diff: null, note: "", level: "section-strong" },
  { major: "기타손익", detail: "기타수익", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "기타비용", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "소     계", detail: "", current: null, previous: null, diff: null, note: "", level: "subtotal" },
  { major: "금융손익", detail: "순수입이자", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "", detail: "기   타", current: null, previous: null, diff: null, note: "", level: "normal" },
  { major: "소     계", detail: "", current: null, previous: null, diff: null, note: "", level: "subtotal" },
  { major: "세 전 이 익", detail: "", current: null, previous: null, diff: null, note: "", level: "section-strong" },
  { major: "법 인 세", detail: "", current: null, previous: null, diff: null, note: "", level: "section" },
  { major: "당기순이익", detail: "", current: null, previous: null, diff: null, note: "", level: "section-strong" }
] as const;

const cumulativeRows = monthlyRows.map((row) => ({ ...row }));

const isTabOptions = [
  { key: "monthly", label: "당월 IS", title: "당월 실적 / 당월IS", subtitle: "기존 dashboard 하단에 당월 IS 표를 추가한 구조입니다. 현재 기준은 ’26년 2월 당월, 비교 기준은 ’25년 2월 당월입니다.", currentLabel: "'26년 2월 당월", previousLabel: "'25년 2월 당월", rows: monthlyRows },
  { key: "cumulative", label: "누적 IS", title: "누적 실적 / 누적IS", subtitle: "기존 dashboard 하단에 누적 IS 표를 추가한 구조입니다. 현재 기준은 ’26년 2월 누적, 비교 기준은 ’25년 2월 누적입니다.", currentLabel: "'26년 2월 누적", previousLabel: "'25년 2월 누적", rows: cumulativeRows }
] as const;

type UploadState = Record<string, { file: string; total: number; success: number; failed: number; status: string }>;

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[tone]}`}>{children}</span>;
}

function Card({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function StepBar() {
  const steps = ["데이터 업로드", "검증 및 매핑", "보고서 미리보기", "다운로드/확정"];
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, idx) => (
        <div key={step} className={`rounded-2xl border p-4 ${idx === 0 ? "border-blue-200 bg-blue-50" : idx < 2 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? "bg-blue-600 text-white" : idx < 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>{idx + 1}</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{step}</p>
              <p className="mt-1 text-xs text-slate-500">업무 진행 상태 표시</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatValue(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return new Intl.NumberFormat("ko-KR").format(value);
  return value;
}

function getRowStyle(level: string) {
  if (level === "section-strong") return "bg-blue-50 font-semibold text-slate-900";
  if (level === "section") return "bg-slate-50 font-semibold text-slate-900";
  if (level === "total") return "bg-slate-100 font-semibold text-slate-900";
  if (level === "subtotal") return "bg-amber-50/50 font-medium text-slate-900";
  return "bg-white text-slate-700";
}

function SummaryCard({ icon: Icon, label, value, helper }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-2 text-blue-600"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, currentLabel, previousLabel }: { title: string; subtitle: string; currentLabel: string; previousLabel: string }) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">손익계산서 시트 중심 보기</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-medium text-slate-500">현재 기준 컬럼</p><p className="mt-1 text-sm font-semibold text-slate-900">{currentLabel}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-medium text-slate-500">비교 기준 컬럼</p><p className="mt-1 text-sm font-semibold text-slate-900">{previousLabel}</p></div>
      </div>
    </div>
  );
}

function EmptyChartCard({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" /><h3 className="text-base font-semibold text-slate-900">{title}</h3></div>
      <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center"><div className="max-w-sm px-6"><p className="text-sm font-medium text-slate-700">차트용 숫자 데이터가 비어 있습니다</p><p className="mt-2 text-sm leading-6 text-slate-500">현재 샘플은 수치가 비어 있어, 숫자 셀은 대시(-)로 표시하고 차트는 비활성 상태로 둡니다.</p></div></div>
    </div>
  );
}

function ISTable({ rows, currentLabel, previousLabel }: { rows: readonly any[]; currentLabel: string; previousLabel: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-white"><tr><th className="px-4 py-3 text-left font-semibold">항목</th><th className="px-4 py-3 text-left font-semibold">세부항목</th><th className="px-4 py-3 text-right font-semibold">{currentLabel}</th><th className="px-4 py-3 text-right font-semibold">{previousLabel}</th><th className="px-4 py-3 text-right font-semibold">차이</th><th className="px-4 py-3 text-left font-semibold">주요 증감 내역</th></tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.major}-${row.detail}-${index}`} className={`${getRowStyle(row.level)} border-t border-slate-200`}>
                <td className="px-4 py-3 whitespace-nowrap">{row.major || ""}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.detail || ""}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatValue(row.current)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatValue(row.previous)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatValue(row.diff)}</td>
                <td className="px-4 py-3 text-slate-500">{row.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ISTab({ activeTab, onChange }: { activeTab: string; onChange: (tab: string) => void }) {
  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {isTabOptions.map((tab) => {
          const isActive = activeTab === tab.key;
          return <button key={tab.key} type="button" onClick={() => onChange(tab.key)} aria-pressed={isActive} className={["inline-flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-all", "w-full sm:w-auto", isActive ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"].join(" ")}>{tab.label}</button>;
        })}
      </div>
    </div>
  );
}

function DashboardISSection() {
  const [activeTab, setActiveTab] = useState("monthly");
  const currentTab = isTabOptions.find((tab) => tab.key === activeTab) ?? isTabOptions[0];
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Finance Reporting Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">재무보고서 자동화 시스템</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">기존 dashboard의 상단 UI는 유지하고, 하단에 <strong>당월 IS</strong>와 <strong>누적 IS</strong>를 탭으로 전환해서 볼 수 있는 분석 영역을 추가했습니다.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"><FileSpreadsheet className="h-4 w-4" /> Excel 다운로드</button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"><Download className="h-4 w-4" /> PDF 출력</button>
          </div>
        </div>
      </div>
      <ISTab activeTab={activeTab} onChange={setActiveTab} />
      <section className="space-y-6">
        <SectionHeader title={currentTab.title} subtitle={currentTab.subtitle} currentLabel={currentTab.currentLabel} previousLabel={currentTab.previousLabel} />
        <div className="grid gap-4 lg:grid-cols-4">
          <SummaryCard icon={Building2} label="회사명" value="전북에너지서비스" helper="엑셀 시트 상단 메타 정보를 기준으로 구성했습니다." />
          <SummaryCard icon={PencilLine} label="작성자" value="홍수삼" helper="기존 보고서 메타 정보를 요약 카드로 표시했습니다." />
          <SummaryCard icon={CalendarRange} label="비교 방식" value="전년 동월 비교" helper="당월/누적 시트 모두 현재값과 전년 동월 값을 나란히 봅니다." />
          <SummaryCard icon={Info} label="단위" value="백만원, 천㎥" helper="시트 표시 단위를 그대로 유지하고, 빈 숫자는 대시(-)로 처리합니다." />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <ISTable rows={currentTab.rows} currentLabel={currentTab.currentLabel} previousLabel={currentTab.previousLabel} />
          <div className="space-y-6">
            <EmptyChartCard title={`${currentTab.title} 비교 시각화`} />
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Table2 className="h-5 w-5 text-blue-600" /><h3 className="text-base font-semibold text-slate-900">시트 반영 요약</h3></div><div className="mt-4 space-y-3 text-sm text-slate-600"><div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="font-medium text-slate-900">반영 방식</p><p className="mt-1 leading-6">원본 엑셀의 손익계산서 표 구조를 유지하면서, dashboard 하단 분석 영역으로 재배치했습니다.</p></div><div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="font-medium text-slate-900">탭 전환 방식</p><p className="mt-1 leading-6">상단 탭에서 당월 IS와 누적 IS를 전환하고, 현재 활성 탭의 표만 표시됩니다.</p></div><div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="font-medium text-slate-900">빈 값 처리</p><p className="mt-1 leading-6">현재 샘플은 수치가 비어 있어, 숫자 셀은 대시(-)로 표시하고 차트는 비활성 상태로 둡니다.</p></div></div></div>
          </div>
        </div>
      </section>
    </section>
  );
}

function DashboardPage() { return <div className="space-y-6"><StepBar /><DashboardISSection /></div>; }

function UploadItemCard({ item, value, onFileChange }: { item: any; value: any; onFileChange: (key: string, file: File | null) => void }) {
  const inputId = `upload-${item.key}`;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">{item.type}</h3><p className="mt-1 text-sm text-slate-500">{item.helper}</p></div><Badge tone={value.status}>{value.status === "ready" ? "업로드 완료" : "검토 필요"}</Badge></div>
      <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4"><p className="text-sm font-medium text-slate-800">선택된 파일</p><p className="mt-1 truncate text-sm text-slate-500">{value.file || "선택된 파일 없음"}</p><div className="mt-4 flex flex-wrap gap-2"><label htmlFor={inputId} className="inline-flex cursor-pointer items-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">파일 선택</label><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">업로드</button></div><input id={inputId} type="file" className="hidden" onChange={(e) => onFileChange(item.key, e.target.files?.[0] || null)} /></div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">총 행수</p><p className="mt-1 font-semibold">{value.total}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">성공</p><p className="mt-1 font-semibold text-emerald-600">{value.success}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">실패</p><p className="mt-1 font-semibold text-rose-600">{value.failed}</p></div></div>
    </div>
  );
}

function UploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadState>(() => uploadTemplates.reduce((acc, item) => { acc[item.key] = { file: item.file, total: item.total, success: item.success, failed: item.failed, status: item.status }; return acc; }, {} as UploadState));
  const handleFileChange = (key: string, file: File | null) => setUploadFiles((prev) => ({ ...prev, [key]: { ...prev[key], file: file ? file.name : "선택된 파일 없음", status: file ? "pending" : prev[key].status } }));
  return (
    <div className="space-y-6">
      <Card title="파일 업로드" subtitle="재무상태표, 손익계산서, LNG매출 부피, LNG매출 열량 파일을 각각 독립적으로 업로드합니다."><div className="grid gap-6 md:grid-cols-2">{uploadTemplates.map((item) => <UploadItemCard key={item.key} item={item} value={uploadFiles[item.key]} onFileChange={handleFileChange} />)}</div></Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="성공 데이터 미리보기" subtitle="정상 인식된 행 샘플"><div className="overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left">기준월</th><th className="px-4 py-3 text-left">계정코드</th><th className="px-4 py-3 text-left">계정명</th><th className="px-4 py-3 text-left">금액</th></tr></thead><tbody>{[["2026-03","410100","매출액","12,480,000,000"],["2026-03","520300","영업이익","1,920,000,000"],["2026-03","LNG_VOL","LNG매출 부피","184,220"]].map((row) => <tr key={row.join("")} className="border-t border-slate-200">{row.map((cell) => <td key={cell} className="px-4 py-3 text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div></Card>
        <Card title="실패 데이터 미리보기" subtitle="사용자가 다시 확인해야 하는 행"><div className="space-y-3">{[["PL_2026-03.xlsx","37행","금액 형식이 잘못되었습니다"],["LNG_VOLUME_2026-03.xlsx","11행","필수 컬럼이 없습니다: 부피"],["LNG_HEAT_2026-03.xlsx","18행","기준월 형식이 잘못되었습니다"]].map(([file,row,msg]) => <div key={file+row} className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-900">{file} · {row}</p><Badge tone="warning">오류</Badge></div><p className="mt-2 text-sm text-slate-600">{msg}</p></div>)}<div className="flex gap-3 pt-2"><button className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">저장</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">재업로드</button></div></div></Card>
      </div>
    </div>
  );
}

function ValidationPage() {
  const [onlyIssues, setOnlyIssues] = useState(false);
  const rows = useMemo(() => (onlyIssues ? validationRows.filter((r) => r.level !== "ready") : validationRows), [onlyIssues]);
  return (
    <div className="space-y-6">
      <Card title="검증 및 매핑" subtitle="업로드된 값이 어떤 보고 항목에 들어가는지 확인하고, 누락/불일치/이상 변동을 검토합니다." right={<div className="flex flex-wrap gap-2"><button className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">자동 매핑 실행</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">재검증</button></div>}><div className="grid gap-4 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">자동 매핑률</p><p className="mt-2 text-2xl font-bold">92%</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">누락 항목</p><p className="mt-2 text-2xl font-bold text-amber-600">3건</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">이상 증감</p><p className="mt-2 text-2xl font-bold text-amber-600">2건</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">중복 의심</p><p className="mt-2 text-2xl font-bold">0건</p></div></div></Card>
      <Card title="오류/경고 필터" subtitle="검토가 필요한 항목만 빠르게 볼 수 있습니다."><div className="flex flex-wrap items-center gap-3"><button onClick={() => setOnlyIssues((v) => !v)} className={`rounded-2xl px-4 py-2.5 text-sm font-medium ${onlyIssues ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>누락 항목만 보기</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">오류 데이터 필터</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">수동 수정/저장</button></div></Card>
      <Card title="검증 결과 표" subtitle="전월/전년 동월 대비 증감과 매핑 상태를 함께 확인합니다."><div className="overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['항목','원천','매핑 대상','값','전월 대비','전년 동월 대비','검토 결과'].map((h) => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.item} className="border-t border-slate-200 bg-white"><td className="px-4 py-4 font-medium text-slate-900">{row.item}</td><td className="px-4 py-4 text-slate-600">{row.source}</td><td className="px-4 py-4 text-slate-600">{row.mapped}</td><td className="px-4 py-4 text-slate-700">{row.value}</td><td className="px-4 py-4 text-slate-700">{row.mom}</td><td className="px-4 py-4 text-slate-700">{row.yoy}</td><td className="px-4 py-4"><Badge tone={row.level}>{row.issue}</Badge></td></tr>)}</tbody></table></div></Card>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="space-y-6"><Card title="보고서 미리보기 및 생성" subtitle="실적보고서와 이사회 자료용 양식을 같은 데이터로 생성합니다." right={<div className="flex flex-wrap gap-2"><button className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">Excel 다운로드</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">PDF 다운로드</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">보고서 확정</button></div>}><div className="grid gap-6 xl:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-blue-600">실적보고서</p><h4 className="mt-1 text-lg font-semibold text-slate-900">2026년 3월 월별 실적보고서</h4></div><Badge tone="warning">검토중</Badge></div><div className="grid gap-3 md:grid-cols-2">{[["매출","₩12,480,000,000"],["영업이익","₩1,920,000,000"],["판매량","184,220"],["증감 요인","수동 코멘트 입력"]].map(([label,value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold text-slate-900">{value}</p></div>)}</div><div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-700">요약 코멘트</p><p className="mt-2 text-sm leading-6 text-slate-600">전월 대비 매출은 증가했으며, LNG 판매량 급증과 일부 비용 감소 항목에 대한 확인이 필요합니다. 초기 버전에서는 이 영역을 사용자가 직접 입력합니다.</p></div></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-blue-600">이사회 자료</p><h4 className="mt-1 text-lg font-semibold text-slate-900">2026년 3월 영업보고서</h4></div><Badge tone="pending">초안</Badge></div><div className="space-y-3">{[["매출","₩12,480,000,000","+8.4%"],["영업이익","₩1,920,000,000","+3.1%"],["LNG 판매량","184,220","+31.2%"],["주요 검토 포인트","2건","경고"]].map(([label,value,delta]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div><Badge tone={delta === "경고" ? "warning" : "neutral"}>{delta}</Badge></div>)}</div><div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-700">미리보기 설명</p><p className="mt-2 text-sm leading-6 text-slate-600">초기 버전은 웹 화면 내 미리보기와 Excel 다운로드를 우선 지원하고, PDF는 브라우저 인쇄 또는 서버 렌더링으로 확장할 수 있게 설계합니다.</p></div></div></div></Card></div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6"><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><Card title="매핑 규칙 관리" subtitle="계정 코드나 계정명 기준으로 보고서 항목 연결 규칙을 설정합니다."><div className="mb-4 flex flex-wrap gap-2"><button className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">계정 매핑 규칙 추가</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">수정</button><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">삭제</button></div><div className="overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{['원천','계정코드','계정명','대상 키','수식','우선순위'].map((h) => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr></thead><tbody>{mappingRules.map((r) => <tr key={r.accountCode} className="border-t border-slate-200 bg-white"><td className="px-4 py-3 text-slate-700">{r.sourceType}</td><td className="px-4 py-3 text-slate-700">{r.accountCode}</td><td className="px-4 py-3 text-slate-700">{r.accountName}</td><td className="px-4 py-3 text-slate-700">{r.target}</td><td className="px-4 py-3 text-slate-700">{r.formula}</td><td className="px-4 py-3 text-slate-700">{r.priority}</td></tr>)}</tbody></table></div></Card><Card title="검증 기준 및 템플릿" subtitle="운영 설정을 바꾸면 하드코딩 없이 화면/검증 동작을 조정할 수 있습니다."><div className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-700">전월 대비 경고 임계치</p><p className="mt-2 text-2xl font-bold text-slate-900">30%</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-700">전년 동월 대비 경고 임계치</p><p className="mt-2 text-2xl font-bold text-slate-900">20%</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-700">활성 템플릿 버전</p><p className="mt-2 text-2xl font-bold text-slate-900">board-v1 / monthly-v1</p></div><div className="flex flex-wrap gap-2"><button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">템플릿 업로드</button><button className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">검증 기준 저장</button></div></div></Card></div></div>
  );
}

export function FinanceReportAutomationApp() {
  const [active, setActive] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [search, setSearch] = useState("");
  const filteredNav = useMemo(() => navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Finance Ops</p><h1 className="mt-2 text-xl font-bold">재무보고서 자동화</h1><p className="mt-2 text-sm leading-6 text-slate-500">월 결산 데이터를 업로드하고, 검증·매핑·보고서 생성까지 한 번에 처리하는 업무 시스템</p></div>
          <div className="px-4 pt-4"><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="메뉴 검색" className="w-full bg-transparent text-sm outline-none" /></div></div>
          <nav className="flex-1 space-y-2 px-4 py-4">{filteredNav.map((item) => { const Icon = item.icon; const activeStyle = active === item.key; return <button key={item.key} onClick={() => setActive(item.key)} className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${activeStyle ? "border-blue-200 bg-blue-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}><div className={`mt-0.5 rounded-xl p-2 ${activeStyle ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}><Icon className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-slate-900">{item.label}</p><p className="mt-1 text-xs text-slate-500">업무 흐름 기반 관리자 화면</p></div></button>; })}</nav>
          <div className="border-t border-slate-200 p-6"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold">현재 목표</p><p className="mt-2 text-sm leading-6 text-slate-600">Plan B를 먼저 완성하고, 나중에 SAP 직접 연동과 로그인/권한 기능으로 확장</p></div></div>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><div className="flex items-center gap-2"><Database className="h-4 w-4 text-blue-600" /><p className="text-sm font-semibold">업무형 관리자 대시보드</p></div><p className="mt-1 text-sm text-slate-500">흰색 배경 · 회색 구분선 · 포인트 블루</p></div><div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="mb-1 text-xs font-medium text-slate-500">기준월 선택</p><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none">{months.map((month) => <option key={month}>{month}</option>)}</select></div><button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />새 보고서 생성</button><Badge tone="ready">Supabase 확장 가능</Badge></div></div></header>
          <main className="space-y-6 p-6 lg:p-8">
            {active !== "dashboard" && <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">전체 설계 미리보기</p><h2 className="mt-2 text-3xl font-bold tracking-tight">재무보고서 자동화 서비스</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">원천 재무 데이터를 업로드하면 검증·매핑·보고서 생성까지 자동으로 이어지고, 사람은 마지막 검토만 하면 되도록 설계한 업무 시스템입니다.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"><FolderOpen className="h-4 w-4" />최근 업로드 보기</button><button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"><AlertTriangle className="h-4 w-4" />오류 내역 확인</button></div></div>}
            {active === "dashboard" && <DashboardPage />}
            {active === "upload" && <UploadPage />}
            {active === "validation" && <ValidationPage />}
            {active === "reports" && <ReportsPage />}
            {active === "settings" && <SettingsPage />}
          </main>
        </div>
      </div>
    </div>
  );
}
