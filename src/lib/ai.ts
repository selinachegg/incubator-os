import { prisma } from "./prisma";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export type AIProvider = "anthropic" | "gemini" | "openrouter";

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  gemini: "gemini-2.5-flash",
  openrouter: "google/gemini-2.5-flash:free",
};

export async function getAIConfig(): Promise<AIConfig> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["ai_provider", "ai_api_key", "ai_model"] } },
  });

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const provider = (map.ai_provider || "gemini") as AIProvider;
  const apiKey = map.ai_api_key || "";
  const model = map.ai_model || DEFAULT_MODELS[provider];

  return { provider, apiKey, model };
}

export async function saveAIConfig(config: {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}) {
  const entries = [
    { key: "ai_provider", value: config.provider },
    { key: "ai_api_key", value: config.apiKey },
    { key: "ai_model", value: config.model || DEFAULT_MODELS[config.provider] },
  ];

  for (const entry of entries) {
    await prisma.setting.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }
}

// Unified completion function
async function complete(
  system: string,
  userMessage: string,
  maxTokens: number = 1024
): Promise<string> {
  const config = await getAIConfig();

  if (!config.apiKey) {
    throw new Error("No API key configured. Go to Settings to add one.");
  }

  if (config.provider === "anthropic") {
    const client = new Anthropic({ apiKey: config.apiKey });
    const message = await client.messages.create({
      model: config.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    });
    return message.content[0].type === "text" ? message.content[0].text : "";
  }

  if (config.provider === "gemini") {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({
      model: config.model,
      systemInstruction: system,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text();
  }

  if (config.provider === "openrouter") {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: config.apiKey,
    });
    // Don't set max_tokens — let OpenRouter use whatever credits are available
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    });
    return response.choices[0]?.message?.content || "";
  }

  throw new Error(`Unknown provider: ${config.provider}`);
}

// --- Exported AI functions ---

export interface AnalysisResult {
  summary: string;
  key_insights: string[];
  action_items: string[];
  tags: string[];
}

const SYSTEM_PROMPT = `You are an expert startup advisor and note-taker.
You analyze raw session notes from startup incubator trainings, mentor meetings, and workshops.
Extract structured insights that are actionable and clear.
Always respond with valid JSON only, no markdown fences.`;

const USER_PROMPT = (notes: string) => `Analyze these session notes and return a JSON object with:
- "summary": A concise 2-3 sentence summary of the session
- "key_insights": An array of 3-7 key insights or learnings
- "action_items": An array of specific, actionable next steps
- "tags": An array of lowercase topic tags (e.g. "gtm", "product", "pricing", "fundraising", "team", "metrics", "strategy")

Session notes:
${notes}

Return ONLY valid JSON, no other text.`;

export async function analyzeNotes(rawNotes: string): Promise<AnalysisResult> {
  const text = await complete(SYSTEM_PROMPT, USER_PROMPT(rawNotes));

  try {
    const parsed = JSON.parse(text);
    if (
      !parsed.summary ||
      !Array.isArray(parsed.key_insights) ||
      !Array.isArray(parsed.action_items) ||
      !Array.isArray(parsed.tags)
    ) {
      throw new Error("Invalid response structure from AI");
    }
    return parsed as AnalysisResult;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

export async function fixWriting(text: string, isHtml: boolean = false): Promise<string> {
  let inputText = text;
  const imagePlaceholders: { placeholder: string; original: string }[] = [];

  // If HTML, strip <img> tags (especially large base64 ones) and replace with placeholders
  // so the AI only sees text content. We restore images after.
  if (isHtml) {
    let imgIndex = 0;
    inputText = text.replace(/<img[^>]*>/gi, (match) => {
      const placeholder = `<!--IMG_PLACEHOLDER_${imgIndex}-->`;
      imagePlaceholders.push({ placeholder, original: match });
      imgIndex++;
      return placeholder;
    });
  }

  const systemPrompt = isHtml
    ? `You are a proofreader. You will receive HTML content.
ONLY fix spelling mistakes, grammar errors, and punctuation in the TEXT content.
Do NOT modify, remove, or add any HTML tags. Preserve ALL HTML structure exactly as-is.
Do NOT change wording, tone, style, or structure.
Do NOT add new content or remove existing content.
The HTML may contain comment placeholders like <!--IMG_PLACEHOLDER_0--> — these represent images. Do NOT remove, modify, or move them. Keep them exactly where they are.
ONLY correct typos, misspellings, missing punctuation, and grammatical errors in the visible text.
Return the FULL HTML with corrections applied. No markdown fences, no explanations, no wrapping. Return raw HTML only.`
    : `You are a proofreader. ONLY fix spelling mistakes, grammar errors, and punctuation.
Do NOT rewrite sentences. Do NOT change wording, tone, style, or structure.
Do NOT add new content, remove content, or rephrase anything.
ONLY correct typos, misspellings, missing punctuation, and grammatical errors.
Return ONLY the corrected text, nothing else. No explanations, no quotes around it.`;

  let result = await complete(systemPrompt, inputText, 4096);

  // Strip markdown code fences if the AI wrapped the response
  result = result.replace(/^```(?:html)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  // Restore image tags from placeholders
  for (const { placeholder, original } of imagePlaceholders) {
    result = result.replace(placeholder, original);
  }

  return result;
}

export async function expandAction(
  actionItem: string,
  sessionContext: string
): Promise<string> {
  return complete(
    `You are a startup advisor. Expand the given action item into a detailed, actionable plan with concrete steps.
Use the session context to make it specific and relevant.
Return a well-structured expansion in 3-5 bullet points. Use plain text with dashes for bullets.`,
    `Session context:\n${sessionContext}\n\nAction item to expand:\n${actionItem}`
  );
}

export async function generateArticle(params: {
  title: string;
  rawNotes: string;
  summary?: string;
  keyInsights?: string;
  mentor?: string;
  topic: string;
}): Promise<string> {
  const system = `You are a startup knowledge curator and educator.
Your job is to take raw session notes from an incubator program and transform them into a well-structured, insightful article.

The article should:
- Organize the ideas logically with clear sections and headings
- Explain concepts in more depth than the raw notes
- Add context and connect ideas together
- Highlight the most important takeaways
- Make the knowledge actionable and memorable
- Use a professional but approachable tone

Format the output as clean HTML with h2, h3, p, ul/li, strong, em tags. No markdown. No wrapper div.
Do NOT invent information that isn't in the notes — only develop and explain what's there.`;

  const userMsg = `Transform these session notes into a well-structured knowledge article.

Session: ${params.title}
${params.mentor ? `Mentor: ${params.mentor}` : ""}
Topic: ${params.topic}
${params.summary ? `\nAI Summary: ${params.summary}` : ""}
${params.keyInsights ? `\nKey Insights: ${params.keyInsights}` : ""}

Raw Notes:
${params.rawNotes}

Write a thorough, organized article that develops these notes into deeper knowledge. Use HTML formatting.`;

  return complete(system, userMsg, 3000);
}
