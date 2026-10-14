import { gEval, runEvalCli } from "@anvia/core/evals";
import { OpenAIClient } from "@anvia/openai";
import { runAgent } from "../index.ts";

const judge = new OpenAIClient({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  baseUrl: "https://openrouter.ai/api/v1",
}).completionModel({ modelId: "openai/gpt-6-luna", api: "chat" });

const correctness = gEval({
  name: "correctness",
  model: judge,
  threshold: 0.7,
  evaluationParams: ["input", "actualOutput", "expectedOutput"],
  criteria:
    "Bandingkan jawaban agent dengan ekspektasi. Semua poin 'Wajib' harus ada, dan tidak boleh melanggar 'Larangan'.",
  rubric: [
    {
      scoreRange: [0, 3],
      expectedOutcome: "Melanggar larangan, atau poin wajib salah/tidak ada.",
    },
    {
      scoreRange: [4, 6],
      expectedOutcome: "Sebagian poin wajib ada, sebagian kurang.",
    },
    {
      scoreRange: [7, 10],
      expectedOutcome: "Semua poin wajib ada dan tidak melanggar larangan.",
    },
  ],
});

await runEvalCli({
  name: "hr/faq",
  exitCode: true,
  target: (prompt: string) => runAgent({ prompt }).text,
  cases: [
    {
      id: "gajian",
      input: "Gajian tanggal berapa ya?",
      expected:
        "Wajib: gaji dibayarkan setiap tanggal 25; jika tanggal 25 hari libur, dibayarkan pada hari kerja sebelumnya. Larangan: menyebut tanggal lain.",
    },
    {
      id: "wfh",
      input: "Saya boleh kerja dari rumah berapa hari dalam seminggu?",
      expected:
        "Wajib: maksimal 2 hari per minggu dengan persetujuan atasan langsung melalui Portal HR. Larangan: menyebut batas hari lain.",
    },
    {
      id: "slip-gaji",
      input: "Slip gaji saya bisa diunduh di mana?",
      expected: "Wajib: di Portal HR menu Payroll, mulai tanggal 25 setiap bulan.",
    },
    {
      id: "tidak-ada-di-faq",
      input: "Apakah kantor menyediakan fasilitas gym untuk karyawan?",
      expected:
        "Wajib: menyatakan informasi ini belum ada di dokumen perusahaan dan mengarahkan ke tim HR. Larangan: mengarang ada atau tidaknya fasilitas gym.",
    },
  ],
  metrics: [correctness],
});
