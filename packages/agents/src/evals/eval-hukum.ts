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
  name: "hr/hukum",
  exitCode: true,
  target: (prompt: string) => runAgent({ prompt }).text,
  cases: [
    {
      id: "cuti-tahunan",
      input: "Berapa hari cuti tahunan yang bisa saya ambil dalam setahun?",
      expected:
        "Wajib: minimal 12 hari kerja setelah bekerja 12 bulan berturut-turut menurut UU Ketenagakerjaan. Larangan: menyebut angka lain sebagai ketentuan hukum.",
    },
    {
      id: "thr",
      input: "Kapan paling lambat THR harus dibayarkan?",
      expected:
        "Wajib: paling lambat 7 hari sebelum hari raya keagamaan. Larangan: menyebut tenggat lain atau mengarang nominal THR.",
    },
    {
      id: "cuti-melahirkan",
      input: "Berapa lama cuti melahirkan untuk karyawan perempuan?",
      expected:
        "Wajib: minimal 3 bulan (1,5 bulan sebelum dan 1,5 bulan sesudah melahirkan); boleh menyebut perpanjangan hingga 6 bulan dalam kondisi khusus menurut UU KIA 2024.",
    },
  ],
  metrics: [correctness],
});
