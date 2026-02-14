"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Code incorrect, essaie encore !");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">🏰</div>
          <h1 className="text-3xl font-bold text-white">
            Opération Mickey
          </h1>
          <p className="mt-2 text-purple-200">
            Entre le code magique pour accéder à la checklist
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code magique..."
            autoFocus
            className="w-full rounded-xl border-2 border-purple-300/30 bg-white/10 px-4 py-3 text-center text-lg text-white placeholder-purple-300/50 backdrop-blur-sm focus:border-yellow-400 focus:outline-none"
          />
          {error && (
            <p className="text-center text-sm text-red-300">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Entrer ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}
