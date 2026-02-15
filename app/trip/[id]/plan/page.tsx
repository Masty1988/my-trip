"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Trip, Attraction } from "@/lib/types";

type Filter = "all" | "tous_ensemble" | "grand_seul" | "spectacle";

const ZONE_ORDER = [
  "Fantasyland",
  "Adventureland",
  "Frontierland",
  "Discoveryland",
  "Main Street",
];

const ZONE_EMOJIS: Record<string, string> = {
  Fantasyland: "🏰",
  Adventureland: "🏝️",
  Frontierland: "🤠",
  Discoveryland: "🚀",
  "Main Street": "🎭",
};

const CATEGORY_BADGES: Record<string, { label: string; color: string }> = {
  tous_ensemble: { label: "Tous ensemble", color: "bg-emerald-500/20 text-emerald-300" },
  grand_seul: { label: "Papa + Grand", color: "bg-blue-500/20 text-blue-300" },
  spectacle: { label: "Spectacle", color: "bg-yellow-500/20 text-yellow-300" },
};

export default function PlanPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function fetchData() {
      const [tripRes, attractionsRes] = await Promise.all([
        getSupabase().from("trips").select("*").eq("id", id).single(),
        getSupabase()
          .from("attractions")
          .select("*")
          .eq("trip_id", id)
          .order("name"),
      ]);
      setTrip(tripRes.data);
      setAttractions(attractionsRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <p className="text-purple-300">Chargement...</p>;
  if (!trip) return <p className="text-red-300">Voyage introuvable.</p>;

  const filtered =
    filter === "all"
      ? attractions
      : attractions.filter((a) => a.category === filter);

  const grouped = ZONE_ORDER.map((zone) => ({
    zone,
    items: filtered.filter((a) => a.zone === zone),
  })).filter((g) => g.items.length > 0);

  const filterButtons: { key: Filter; label: string; activeClass: string }[] = [
    { key: "all", label: "Tout afficher", activeClass: "btn-primary" },
    {
      key: "tous_ensemble",
      label: "Tous ensemble 🟢",
      activeClass: "bg-emerald-500/30 border-emerald-400/50 text-emerald-200 font-bold",
    },
    {
      key: "grand_seul",
      label: "Papa + Grand 🔵",
      activeClass: "bg-blue-500/30 border-blue-400/50 text-blue-200 font-bold",
    },
    {
      key: "spectacle",
      label: "Spectacles 🟡",
      activeClass: "bg-yellow-500/30 border-yellow-400/50 text-yellow-200 font-bold",
    },
  ];

  const inactiveClass =
    "rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-purple-200 transition-all hover:border-gold/30 hover:bg-white/10";

  return (
    <div>
      <Link href={`/trip/${id}`} className="text-sm text-purple-300 hover:text-gold">
        ← Retour
      </Link>
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
        <p className="mt-1 text-sm text-purple-300">
          {new Date(trip.start_date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <Link
          href={`/trip/${id}`}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-purple-200 transition-all hover:border-gold/30 hover:bg-white/10"
        >
          📋 Listes
        </Link>
        <Link
          href={`/trip/${id}/guide`}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-purple-200 transition-all hover:border-gold/30 hover:bg-white/10"
        >
          📅 Guide
        </Link>
        <Link
          href={`/trip/${id}/plan`}
          className="btn-primary text-sm"
        >
          🗺️ Plan
        </Link>
      </div>

      {/* Plan placeholder */}
      <div className="card mb-6 flex items-center justify-center" style={{ minHeight: "180px" }}>
        <div className="text-center">
          <p className="text-3xl mb-2">🗺️</p>
          <p className="text-sm text-purple-300">Plan du parc Disneyland Paris</p>
          <p className="text-xs text-purple-300/50 mt-1">Image a venir</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={
              filter === btn.key
                ? btn.key === "all"
                  ? "btn-primary text-sm"
                  : `rounded-xl border px-4 py-2.5 text-sm transition-all ${btn.activeClass}`
                : inactiveClass
            }
          >
            {btn.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-purple-300">
        {filtered.length} attraction{filtered.length > 1 ? "s" : ""}
      </p>

      {/* Attractions grouped by zone */}
      <div className="space-y-6">
        {grouped.map(({ zone, items }) => (
          <div key={zone}>
            <h2 className="mb-3 text-lg font-semibold text-white">
              {ZONE_EMOJIS[zone] ?? "📍"} {zone}
            </h2>
            <ul className="space-y-2">
              {items.map((attraction) => {
                const badge = CATEGORY_BADGES[attraction.category];
                return (
                  <li key={attraction.id} className="card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">
                            {attraction.is_priority && (
                              <span className="mr-1">⭐</span>
                            )}
                            {attraction.name}
                          </span>
                          {badge && (
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          )}
                          {attraction.height_min && (
                            <span className="inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                              {attraction.height_min} cm min
                            </span>
                          )}
                        </div>
                        {attraction.tips && (
                          <p className="mt-1 text-sm text-purple-300">
                            {attraction.tips}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-purple-300/60">
          Aucune attraction pour ce filtre.
        </p>
      )}
    </div>
  );
}
