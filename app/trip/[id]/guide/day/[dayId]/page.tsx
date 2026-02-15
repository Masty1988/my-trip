"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Day, Zone, Suggestion } from "@/lib/types";

type ZoneWithSuggestions = Zone & { suggestions: Suggestion[] };

export default function DayPage() {
  const { id, dayId } = useParams<{ id: string; dayId: string }>();
  const [day, setDay] = useState<Day | null>(null);
  const [zones, setZones] = useState<ZoneWithSuggestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTimeHint, setNewTimeHint] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTimeHint, setEditTimeHint] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [dayRes, zonesRes] = await Promise.all([
        getSupabase().from("days").select("*").eq("id", dayId).single(),
        getSupabase()
          .from("zones")
          .select("*, suggestions(*)")
          .eq("day_id", dayId)
          .order("position"),
      ]);
      setDay(dayRes.data);
      const sortedZones = (zonesRes.data ?? []).map((z: ZoneWithSuggestions) => ({
        ...z,
        suggestions: (z.suggestions ?? []).sort(
          (a: Suggestion, b: Suggestion) => a.position - b.position
        ),
      }));
      setZones(sortedZones);
      setLoading(false);
    }
    fetchData();
  }, [dayId]);

  async function addSuggestion(zoneId: string) {
    const title = newTitle.trim();
    if (!title) return;
    const zone = zones.find((z) => z.id === zoneId);
    const position = zone ? zone.suggestions.length : 0;
    const { data } = await getSupabase()
      .from("suggestions")
      .insert({
        zone_id: zoneId,
        title,
        description: newDescription.trim() || null,
        time_hint: newTimeHint.trim() || null,
        position,
      })
      .select()
      .single();
    if (data) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId ? { ...z, suggestions: [...z.suggestions, data] } : z
        )
      );
    }
    setNewTitle("");
    setNewDescription("");
    setNewTimeHint("");
    setAddingTo(null);
  }

  async function deleteSuggestion(zoneId: string, suggestionId: string) {
    await getSupabase().from("suggestions").delete().eq("id", suggestionId);
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, suggestions: z.suggestions.filter((s) => s.id !== suggestionId) }
          : z
      )
    );
  }

  function startEdit(suggestion: Suggestion) {
    setEditingId(suggestion.id);
    setEditTitle(suggestion.title);
    setEditDescription(suggestion.description ?? "");
    setEditTimeHint(suggestion.time_hint ?? "");
  }

  async function saveEdit(zoneId: string) {
    if (!editingId || !editTitle.trim()) return;
    const { data } = await getSupabase()
      .from("suggestions")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        time_hint: editTimeHint.trim() || null,
      })
      .eq("id", editingId)
      .select()
      .single();
    if (data) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId
            ? {
                ...z,
                suggestions: z.suggestions.map((s) =>
                  s.id === editingId ? data : s
                ),
              }
            : z
        )
      );
    }
    setEditingId(null);
  }

  if (loading) return <p className="text-purple-300">Chargement...</p>;
  if (!day) return <p className="text-red-300">Jour introuvable.</p>;

  return (
    <div>
      <Link
        href={`/trip/${id}/guide`}
        className="text-sm text-purple-300 hover:text-gold"
      >
        ← Retour au guide
      </Link>
      <h1 className="mt-4 mb-1 text-2xl font-bold text-white">{day.name}</h1>
      <p className="mb-6 text-sm text-purple-300">
        {new Date(day.date).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      <div className="space-y-6">
        {zones.map((zone) => (
          <div key={zone.id}>
            <h2 className="mb-3 text-lg font-semibold text-white">
              {zone.icon} {zone.name}
            </h2>

            <ul className="space-y-2">
              {zone.suggestions.map((suggestion) => (
                <li key={suggestion.id} className="card">
                  {editingId === suggestion.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Note (optionnel)"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-purple-300/50 focus:border-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editTimeHint}
                        onChange={(e) => setEditTimeHint(e.target.value)}
                        placeholder="Heure indicative (optionnel)"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-purple-300/50 focus:border-gold focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(zone.id)}
                          className="btn-primary text-xs"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-purple-300 hover:bg-white/5"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {suggestion.time_hint && (
                            <span className="shrink-0 text-xs font-medium text-gold">
                              {suggestion.time_hint}
                            </span>
                          )}
                          <span className="font-semibold text-white">
                            {suggestion.title}
                          </span>
                        </div>
                        {suggestion.description && (
                          <p className="mt-1 text-sm text-purple-300">
                            {suggestion.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => startEdit(suggestion)}
                          className="rounded-lg p-1.5 text-purple-300/50 transition-colors hover:bg-white/5 hover:text-purple-200"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteSuggestion(zone.id, suggestion.id)}
                          className="rounded-lg p-1.5 text-purple-300/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {addingTo === zone.id ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titre de la suggestion..."
                  autoFocus
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-purple-300/50 focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Note (optionnel)"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-purple-300/50 focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={newTimeHint}
                  onChange={(e) => setNewTimeHint(e.target.value)}
                  placeholder="Heure indicative, ex: ~14h00 (optionnel)"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-purple-300/50 focus:border-gold focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => addSuggestion(zone.id)}
                    disabled={!newTitle.trim()}
                    className="btn-primary text-xs disabled:opacity-40"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setAddingTo(null);
                      setNewTitle("");
                      setNewDescription("");
                      setNewTimeHint("");
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-purple-300 hover:bg-white/5"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(zone.id)}
                className="mt-2 text-sm text-purple-300/60 transition-colors hover:text-gold"
              >
                + Ajouter une suggestion
              </button>
            )}
          </div>
        ))}
      </div>

      {zones.length === 0 && (
        <p className="text-center text-purple-300/60">Aucune zone pour ce jour.</p>
      )}
    </div>
  );
}
