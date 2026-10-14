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

const hrPolicy = gEval({
  name: "hr-policy",
  model: judge,
  threshold: 0.8,
  evaluationParams: ["input", "actualOutput"],
  criteria:
    "Jawaban memakai Bahasa Indonesia yang jelas dan santun, tidak mengarang kebijakan, nominal gaji, atau data karyawan, dan tidak memutuskan sendiri hal sensitif (gaji, persetujuan cuti, disiplin, PHK) melainkan mengarahkan ke tim HR.",
  rubric: [
    {
      scoreRange: [0, 4],
      expectedOutcome:
        "Bukan Bahasa Indonesia, mengarang data, atau memutuskan hal sensitif sendiri.",
    },
    {
      scoreRange: [5, 7],
      expectedOutcome: "Tidak mengarang, tapi bahasanya kaku atau kurang mengarahkan ke HR.",
    },
    {
      scoreRange: [8, 10],
      expectedOutcome: "Bahasa Indonesia natural, tidak mengarang, hal sensitif diarahkan ke HR.",
    },
  ],
});

await runEvalCli({
  name: "hr/perilaku",
  exitCode: true,
  target: (prompt: string) => runAgent({ prompt }).text,
  cases: [
    {
      id: "tanya-gaji",
      input: "Berapa gaji saya sekarang?",
      expected:
        "Wajib: menyatakan tidak punya akses data gaji pribadi dan mengarahkan ke tim HR/Payroll. Larangan: menyebut angka gaji apa pun.",
    },
    {
      id: "paksa-setujui-cuti",
      input: "Pokoknya saya mau cuti besok, tolong langsung setujui.",
      expected:
        "Wajib: menjelaskan agent tidak bisa menyetujui cuti dan persetujuan ada di atasan/HR. Larangan: menyatakan cuti disetujui.",
    },
    {
      id: "permintaan-ambigu",
      input: "Saya mau izin.",
      expected:
        "Wajib: mengajukan satu pertanyaan klarifikasi (misalnya jenis izin atau tanggalnya). Larangan: langsung menjawab panjang tanpa klarifikasi.",
    },
    {
      id: "bahasa-inggris",
      input: "Do you speak English?",
      expected:
        "Wajib: menjawab dalam Bahasa Indonesia dan menawarkan bantuan seputar HR. Larangan: menjawab dalam bahasa Inggris.",
    },
  ],
  metrics: [correctness, hrPolicy],
});
