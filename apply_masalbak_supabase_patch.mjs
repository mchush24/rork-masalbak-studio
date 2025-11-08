// apply_masalbak_supabase_patch.mjs
// MasalBak • Supabase Kalıcı Veri + Gerçek Üretim (OpenAI Img/TTS, Puppeteer PDF, Sharp line-art)
// Kullanım:
//   1) Bu dosyayı repo köküne kaydet
//   2) node apply_masalbak_supabase_patch.mjs
//   3) pnpm i
//   4) Server env'lerini ayarla (OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE, EXPO_PUBLIC_API, ...)
//   5) pnpm dev

import fs from "node:fs";
import path from "node:path";

const W = (p, s) => {
  const f = path.resolve(p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s.replace(/^\n/, ""), "utf8");
  console.log("✓ wrote", p);
};

const A = (p, deps = []) => {
  const f = path.resolve(p);
  if (!fs.existsSync(f)) {
    console.log("⚠ skipped (not found)", p);
    return;
  }
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const d of deps) {
    const [name, ver] = d.split("@");
    if (!j.dependencies) j.dependencies = {};
    if (!j.devDependencies) j.devDependencies = {};
    if (!j.dependencies[name] && !j.devDependencies[name]) {
      j.dependencies[name] = ver || "latest";
      console.log("  + dep", name);
    }
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  console.log("✓ updated deps in", p);
};

// ---------------------------------------------------------------------------
// 1) SERVER: Supabase client, persistence helpers, story/img/tts/pdf/coloring
// ---------------------------------------------------------------------------

A("package.json", [
  "@supabase/supabase-js@^2.45.0",
  "openai@^4.57.0",
  "puppeteer@^23.7.0",
  "sharp@^0.33.4"
]);

W("backend/lib/supabase.ts", `
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY!;
if (!url || !key) throw new Error("Supabase env missing: SUPABASE_URL + SUPABASE_SERVICE_ROLE/ANON");

export const supa = createClient(url, key, { auth: { persistSession: false } });

export async function uploadBuffer(bucket: string, filePath: string, buf: Buffer, contentType: string) {
  const { error } = await supa.storage.from(bucket).upload(filePath, buf, {
    contentType, upsert: true
  });
  if (error) throw error;
  const { data } = supa.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
`);

W("backend/lib/persist.ts", `
import { supa } from "./supabase.js";

export async function saveStorybookRecord(user_id: string | null, title: string, pages: any[], pdf_url?: string|null, voice_urls?: string[]|null) {
  const { data, error } = await supa
    .from("storybooks")
    .insert({ user_id, title, pages, pdf_url: pdf_url || null, voice_urls: voice_urls || null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function saveColoringRecord(user_id: string | null, title: string, pdf_url: string, page_count: number) {
  const { data, error } = await supa
    .from("colorings")
    .insert({ user_id, title, pdf_url, page_count })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listStorybooks(user_id: string | null, limit = 20) {
  const q = supa.from("storybooks").select("*").order("created_at", { ascending: false }).limit(limit);
  const { data, error } = user_id ? await q.eq("user_id", user_id) : await q;
  if (error) throw error;
  return data;
}

export async function listColorings(user_id: string | null, limit = 20) {
  const q = supa.from("colorings").select("*").order("created_at", { ascending: false }).limit(limit);
  const { data, error } = user_id ? await q.eq("user_id", user_id) : await q;
  if (error) throw error;
  return data;
}
`);

W("backend/lib/story.ts", `
import OpenAI from "openai";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = process.env.SUPABASE_BUCKET || "masalbak";
const BASE_STYLE = "soft pastel, minimal line-art, kid-friendly, flat lighting, plain background, no text, copyright-free";

type PageSpec = { text: string; prompt?: string };
type MakeOptions = { pages: PageSpec[]; lang?: "tr"|"en"; makePdf?: boolean; makeTts?: boolean; title?: string; user_id?: string|null };

export async function generateImageForPage(text: string, prompt?: string) {
  const p = prompt || \`Children's picture-book illustration, \${BASE_STYLE}. Turkish theme: \${text}\`;
  const img = await oai.images.generate({ model: "dall-e-3", prompt: p, size: "1024x1024", response_format: "b64_json" });
  const b64 = img.data[0].b64_json!;
  return Buffer.from(b64, "base64");
}

export async function makeStorybook(opts: MakeOptions) {
  const imgs: string[] = [];
  for (let i=0;i<opts.pages.length;i++){
    try {
      const png = await generateImageForPage(opts.pages[i].text, opts.pages[i].prompt);
      const url = await uploadBuffer(BUCKET, \`images/story_\${Date.now()}_\${i+1}.png\`, png, "image/png");
      imgs.push(url);
    } catch (e) {
      console.error("Image generation failed:", e);
      imgs.push("about:blank");
    }
  }

  let pdf_url: string|undefined;
  if (opts.makePdf) {
    const html = htmlDoc(opts.pages.map((p,i)=>({ text: p.text, img: imgs[i] })));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } });
    await browser.close();
    pdf_url = await uploadBuffer(BUCKET, \`pdf/story_\${Date.now()}.pdf\`, Buffer.from(pdf), "application/pdf");
  }

  let voice_urls: string[]|undefined;
  if (opts.makeTts) {
    voice_urls = [];
    for (let i=0;i<opts.pages.length;i++){
      const t = opts.pages[i].text;
      const speech = await oai.audio.speech.create({ model: "tts-1", voice: "alloy", input: t });
      const mp3 = Buffer.from(await speech.arrayBuffer());
      const vurl = await uploadBuffer(BUCKET, \`audio/story_\${Date.now()}_\${i+1}.mp3\`, mp3, "audio/mpeg");
      voice_urls.push(vurl);
    }
  }

  return {
    pages: opts.pages.map((p,i)=>({ text: p.text, img_url: imgs[i] })),
    pdf_url, voice_urls
  };
}

function htmlDoc(pages: { text: string; img: string }[]) {
  const items = pages.map(p => \`
    <div class="page">
      <div class="img"><img src="\${p.img}" /></div>
      <div class="text">\${escapeHtml(p.text)}</div>
    </div>\`).join("\\n");
  return \`<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a}
    .page{page-break-after:always;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:16mm}
    .img img{max-width:100%;max-height:70vh;display:block;margin-bottom:12px}
    .text{font-size:16px;line-height:1.45;text-align:center}
  </style></head><body>\${items}</body></html>\`;
}
function escapeHtml(s: string){return s.replace(/[&<>"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c] as string));}
`);

W("backend/lib/coloring.ts", `
import sharp from "sharp";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";

const BUCKET = process.env.SUPABASE_BUCKET || "masalbak";

async function toLineArt(input: string|Buffer) {
  let buf: Buffer;
  if (typeof input === "string") {
    if (input.startsWith("data:image/")) buf = Buffer.from(input.split(",").pop()||"", "base64");
    else throw new Error("toLineArt expects data-uri or Buffer");
  } else buf = input;

  const out = await sharp(buf)
    .grayscale()
    .median(3)
    .linear(1.3, -15)
    .threshold(210)
    .toFormat("png")
    .toBuffer();
  return out;
}

export async function makeColoringPDF(pages: string[], title: string, size: "A4"|"A3") {
  const lineUrls: string[] = [];
  for (const dataUri of pages) {
    const line = await toLineArt(dataUri);
    const url = await uploadBuffer(BUCKET, \`images/line_\${Date.now()}_\${Math.floor(Math.random()*1e6)}.png\`, line, "image/png");
    lineUrls.push(url);
  }
  const html = htmlDoc(title, lineUrls);
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: size, printBackground: true, margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" } });
  await browser.close();
  const pdfUrl = await uploadBuffer(BUCKET, \`pdf/coloring_\${Date.now()}.pdf\`, Buffer.from(pdf), "application/pdf");
  return { pdfUrl, pageCount: lineUrls.length };
}

function htmlDoc(title: string, imgs: string[]) {
  const items = imgs.map(u => \`<div class="page"><img src="\${u}" /></div>\`).join("\\n");
  return \`<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:0}
    h1{font-family: Arial, Helvetica, sans-serif; font-size: 16px; text-align:center; margin: 8px 0;}
    .page{page-break-after: always; display:flex; align-items:center; justify-content:center; height: 100vh; padding: 10mm}
    img{max-width:100%; max-height: 95vh;}
  </style></head><body>
  <h1>\${escapeHtml(title)}</h1>
  \${items}
  </body></html>\`;
}
function escapeHtml(s: string){return s.replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string));}
`);

W("backend/trpc/routes/studio/create-storybook.ts", `
import { z } from "zod";
import { publicProcedure } from "../../create-context.js";
import { makeStorybook } from "../../../lib/story.js";
import { saveStorybookRecord } from "../../../lib/persist.js";

const inputSchema = z.object({
  pages: z.array(z.object({ text: z.string(), prompt: z.string().optional() })).min(3).max(10),
  lang: z.enum(["tr","en"]).default("tr"),
  makePdf: z.boolean().default(true),
  makeTts: z.boolean().default(true),
  title: z.string().default("Masal"),
  user_id: z.string().nullable().optional()
});

export const createStorybookProcedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const out = await makeStorybook(input);
    const record = await saveStorybookRecord(
      input.user_id ?? null,
      input.title,
      out.pages,
      out.pdf_url ?? null,
      out.voice_urls ?? null
    );
    return { ...out, record };
  });
`);

W("backend/trpc/routes/studio/generate-coloring-pdf.ts", `
import { z } from "zod";
import { publicProcedure } from "../../create-context.js";
import { makeColoringPDF } from "../../../lib/coloring.js";
import { saveColoringRecord } from "../../../lib/persist.js";

const inputSchema = z.object({
  size: z.enum(["A4","A3"]).default("A4"),
  title: z.string().default("Boyama Sayfası"),
  pages: z.array(z.string()).min(1),
  user_id: z.string().nullable().optional()
});

export const generateColoringPDFProcedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const { pdfUrl, pageCount } = await makeColoringPDF(input.pages, input.title, input.size);
    const record = await saveColoringRecord(
      input.user_id ?? null,
      input.title,
      pdfUrl,
      pageCount
    );
    return { pdf_url: pdfUrl, record };
  });
`);

W("backend/trpc/routes/studio/list-history.ts", `
import { z } from "zod";
import { publicProcedure } from "../../create-context.js";
import { listStorybooks, listColorings } from "../../../lib/persist.js";

export const listStorybooksProcedure = publicProcedure
  .input(z.object({ user_id: z.string().nullable().optional() }))
  .query(async ({ input }) => {
    return await listStorybooks(input.user_id ?? null);
  });

export const listColoringsProcedure = publicProcedure
  .input(z.object({ user_id: z.string().nullable().optional() }))
  .query(async ({ input }) => {
    return await listColorings(input.user_id ?? null);
  });
`);

W("schema.sql", `
-- Supabase Postgres şeması
create table if not exists public.storybooks (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  title text not null,
  pages jsonb not null,
  pdf_url text null,
  voice_urls jsonb null,
  created_at timestamptz default now()
);
create table if not exists public.colorings (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  title text not null,
  pdf_url text not null,
  page_count int not null default 1,
  created_at timestamptz default now()
);
create index if not exists storybooks_user_created_idx on public.storybooks (user_id, created_at desc);
create index if not exists colorings_user_created_idx on public.colorings (user_id, created_at desc);
`);

W("SUPABASE_SETUP.md", `
# MasalBak • Supabase Kurulum

## 1) Supabase Proje Oluştur
- https://supabase.com adresine git
- Yeni proje oluştur
- Project URL ve API Keys'i kopyala

## 2) Storage Bucket Oluştur
- Storage -> New Bucket
- İsim: \`masalbak\`
- Public: ✓ (checked)
- Allowed MIME types: image/*, audio/*, application/pdf

## 3) SQL Schema Çalıştır
- SQL Editor -> New Query
- \`schema.sql\` dosyasının içeriğini kopyala-yapıştır
- Run

## 4) ENV Ayarları (Backend)
\`\`\`
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE=<service_role_key>
SUPABASE_BUCKET=masalbak
OPENAI_API_KEY=sk-...
\`\`\`

## 5) Paketleri Kur ve Çalıştır
\`\`\`bash
bun install
bun dev
\`\`\`

## tRPC Endpoints
- \`studio.createStorybook\` - Masal kitabı oluştur (AI görsel + PDF + TTS)
- \`studio.generateColoringPDF\` - Boyama PDF oluştur
- \`studio.listStorybooks\` - Masal geçmişi
- \`studio.listColorings\` - Boyama geçmişi
`);

console.log("\n✅ Patch başarıyla uygulandı!");
console.log("\n📋 Sonraki adımlar:");
console.log("  1) Supabase hesabı oluştur: https://supabase.com");
console.log("  2) SUPABASE_SETUP.md dosyasındaki talimatları takip et");
console.log("  3) .env dosyasına gerekli değişkenleri ekle");
console.log("  4) bun install");
console.log("  5) backend/trpc/app-router.ts dosyasına yeni route'ları ekle");
