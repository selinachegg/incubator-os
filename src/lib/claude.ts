import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

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
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: USER_PROMPT(rawNotes) }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(text);

    // Validate shape
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
    // Attempt to extract JSON from response if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}
