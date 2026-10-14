import type { Document } from "@anvia/core";

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const HR_FAQ: readonly FaqEntry[] = [
  {
    id: "jam-kerja",
    category: "absensi",
    question: "Berapa jam kerja di kantor?",
    answer: "Jam kerja Senin–Jumat pukul 09.00–18.00 WIB dengan istirahat pukul 12.00–13.00.",
  },
  {
    id: "wfh",
    category: "absensi",
    question: "Boleh WFH berapa hari?",
    answer:
      "Karyawan boleh WFH maksimal 2 hari per minggu dengan persetujuan atasan langsung melalui Portal HR.",
  },
  {
    id: "pengajuan-cuti",
    category: "cuti",
    question: "Bagaimana cara mengajukan cuti?",
    answer:
      "Cuti diajukan lewat Portal HR menu Cuti paling lambat 7 hari kerja sebelumnya dan disetujui oleh atasan langsung.",
  },
  {
    id: "gajian",
    category: "payroll",
    question: "Kapan gajian?",
    answer:
      "Gaji dibayarkan setiap tanggal 25. Jika tanggal 25 jatuh pada hari libur, gaji dibayarkan pada hari kerja sebelumnya.",
  },
  {
    id: "slip-gaji",
    category: "payroll",
    question: "Di mana saya bisa mengunduh slip gaji?",
    answer: "Slip gaji bisa diunduh di Portal HR menu Payroll mulai tanggal 25 setiap bulan.",
  },
  {
    id: "reimburse",
    category: "benefit",
    question: "Bagaimana cara klaim reimbursement?",
    answer:
      "Klaim reimbursement diajukan lewat Portal HR menu Reimbursement paling lambat 30 hari setelah transaksi, dengan melampirkan bukti pembayaran.",
  },
  {
    id: "kontak-hr",
    category: "umum",
    question: "Bagaimana cara menghubungi tim HR?",
    answer: "Tim HR bisa dihubungi lewat kanal Slack #tanya-hr atau ekstensi 100 pada jam kerja.",
  },
];

export const HR_CONTEXT: Document[] = HR_FAQ.map((faq) => ({
  id: `faq-${faq.id}`,
  text: `Pertanyaan: ${faq.question}\nJawaban: ${faq.answer}`,
  additionalProps: { source: "faq-hr-internal", category: faq.category },
}));
