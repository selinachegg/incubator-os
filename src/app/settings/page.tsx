"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

type Provider = "anthropic" | "gemini" | "openrouter";

const PROVIDERS: {
  id: Provider;
  name: string;
  icon: string;
  color: string;
  description: string;
  defaultModel: string;
  models: string[];
  keyPlaceholder: string;
  keyLink: string;
}[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "simple-icons:google",
    color: "text-blue-400",
    description: "Free tier available — great for getting started",
    defaultModel: "gemini-2.5-flash",
    models: [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-3.1-flash-lite-preview",
    ],
    keyPlaceholder: "AIza...",
    keyLink: "https://aistudio.google.com/apikey",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    icon: "simple-icons:anthropic",
    color: "text-purple-400",
    description: "Powerful reasoning — requires paid API credits",
    defaultModel: "claude-sonnet-4-20250514",
    models: [
      "claude-sonnet-4-20250514",
      "claude-haiku-4-5-20251001",
      "claude-opus-4-6",
    ],
    keyPlaceholder: "sk-ant-api03-...",
    keyLink: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: "lucide:globe",
    color: "text-teal-400",
    description: "Access many models — some free options available",
    defaultModel: "google/gemini-2.5-flash:free",
    models: [
      "google/gemini-2.5-flash:free",
      "google/gemini-2.5-flash-lite:free",
      "meta-llama/llama-4-maverick:free",
      "anthropic/claude-sonnet-4",
      "openai/gpt-4o",
    ],
    keyPlaceholder: "sk-or-v1-...",
    keyLink: "https://openrouter.ai/keys",
  },
];

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState<Provider | null>(null);
  const [connectedModel, setConnectedModel] = useState<string>("");
  const [credits, setCredits] = useState<string | null>(null);

  function fetchCredits() {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => {
        if (data.remaining) {
          setCredits(data.remaining);
        } else if (data.credits) {
          setCredits(data.credits);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.provider) {
          setProvider(data.provider);
          setModel(data.model || "");
        }
        setHasKey(data.hasKey);
        if (data.hasKey) {
          setConnectedProvider(data.provider);
          setConnectedModel(data.model || "");
        }
        setLoaded(true);
      });
    fetchCredits();
  }, []);

  const selected = PROVIDERS.find((p) => p.id === provider)!;

  async function handleSave() {
    if (!apiKey.trim()) return;

    setSaving(true);
    setStatus(null);

    const selectedModel = model || selected.defaultModel;

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          model: selectedModel,
        }),
      });

      if (res.ok) {
        setConnectedProvider(provider);
        setConnectedModel(selectedModel);
        setHasKey(true);
        setStatus({ type: "success", message: `Connected to ${selected.name}!` });
        fetchCredits();
      } else {
        const data = await res.json();
        setStatus({ type: "error", message: data.error || "Failed to save" });
      }
    } catch (err) {
      setStatus({ type: "error", message: `Save error: ${err instanceof Error ? err.message : "Unknown error"}` });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/fix-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Ths is a tset of the AI conection." }),
      });

      if (res.ok) {
        const { fixed } = await res.json();
        setStatus({
          type: "success",
          message: `AI is working! Response: "${fixed}"`,
        });
      } else {
        const data = await res.json();
        setStatus({
          type: "error",
          message: data.error || "Test failed — check your API key",
        });
      }
    } catch {
      setStatus({ type: "error", message: "Connection failed" });
    } finally {
      setTesting(false);
    }
  }

  if (!loaded) return null;

  const connectedInfo = connectedProvider
    ? PROVIDERS.find((p) => p.id === connectedProvider)
    : null;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl flex items-center gap-3">
          <Icon icon="lucide:settings" className="text-yellow-400" />
          AI Settings
        </h1>
        <p className="text-white/50 mt-2">
          Choose your AI provider and enter your API key. All features (Insight
          Builder, Fix Spelling, AI Plans, Articles) use this configuration.
        </p>
      </div>

      {/* Current connection status */}
      {connectedInfo && (
        <div className="p-4 bg-teal-400/10 border-2 border-teal-400/30 wobbly-border flex items-center gap-3">
          <Icon
            icon="lucide:check-circle-2"
            className="text-teal-400 text-xl"
          />
          <div>
            <p className="text-teal-400 font-bold font-heading">
              Connected to {connectedInfo.name}
            </p>
            <p className="text-white/50 text-sm">
              Model: {connectedModel} — AI features are active.
              {credits && <span className="ml-2 text-yellow-400">({credits})</span>}
            </p>
          </div>
        </div>
      )}

      {/* Provider selection */}
      <div className="space-y-3">
        <h2 className="font-heading text-xl text-white/70">
          Choose Provider
        </h2>
        <div className="grid gap-3">
          {PROVIDERS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setProvider(p.id);
                setModel(p.defaultModel);
                if (p.id !== connectedProvider) setApiKey("");
                setStatus(null);
              }}
              className={`p-4 border-2 border-black text-left transition-all ${
                i % 2 === 0 ? "wobbly-border" : "wobbly-border-md"
              } ${
                provider === p.id
                  ? "bg-white/10 hard-shadow"
                  : "bg-white/5 hover:bg-white/8"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon icon={p.icon} className={`text-2xl ${p.color}`} />
                <div className="flex-1">
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-xs text-white/40">{p.description}</p>
                </div>
                {provider === p.id && (
                  <Icon icon="lucide:check" className="text-yellow-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key input */}
      <div className="space-y-3">
        <h2 className="font-heading text-xl text-white/70">API Key</h2>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={selected.keyPlaceholder}
            className="flex-1 bg-white/5 border-2 border-black wobbly-border px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400 font-body font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <a
            href={selected.keyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white/60 border-2 border-black wobbly-border-md text-sm hover:bg-white/20 transition-all shrink-0"
          >
            <Icon icon="lucide:external-link" width={14} />
            Get Key
          </a>
        </div>
      </div>

      {/* Model selection */}
      <div className="space-y-3">
        <h2 className="font-heading text-xl text-white/70">Model</h2>
        <div className="flex flex-wrap gap-2">
          {selected.models.map((m, i) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-3 py-1.5 border-2 border-black text-sm font-body transition-all ${
                i % 2 === 0 ? "wobbly-border" : "wobbly-border-md"
              } ${
                (model || selected.defaultModel) === m
                  ? "bg-yellow-400 text-black font-bold hard-shadow"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Warning when key is empty */}
      {!apiKey.trim() && (
        <p className="text-yellow-400/70 text-sm flex items-center gap-2 -mt-4">
          <Icon icon="lucide:alert-triangle" width={14} />
          Paste your {selected.name} API key above to save
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !apiKey.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-black border-2 border-black font-heading font-bold hard-shadow hard-shadow-hover wobbly-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon
            icon={saving ? "lucide:loader-2" : "lucide:save"}
            className={saving ? "animate-spin" : ""}
            width={16}
          />
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-400/20 text-teal-300 border-2 border-black font-heading font-bold wobbly-border-md transition-all hover:bg-teal-400/30 disabled:opacity-50"
        >
          <Icon
            icon={testing ? "lucide:loader-2" : "lucide:zap"}
            className={testing ? "animate-spin" : ""}
            width={16}
          />
          {testing ? "Testing..." : "Test Connection"}
        </button>
      </div>

      {/* Status message */}
      {status && (
        <div
          className={`p-4 border-2 border-black wobbly-border ${
            status.type === "success"
              ? "bg-teal-400/10 text-teal-400"
              : "bg-red-400/10 text-red-400"
          }`}
        >
          <div className="flex items-start gap-2">
            <Icon
              icon={
                status.type === "success"
                  ? "lucide:check-circle-2"
                  : "lucide:alert-circle"
              }
              className="mt-0.5 shrink-0"
            />
            <p className="text-sm">{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
