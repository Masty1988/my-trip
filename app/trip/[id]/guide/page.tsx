"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Trip, Day, Zone } from "@/lib/types";

type DayWithZones = Day & { zones: Zone[] };

export default function GuidePage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<DayWithZones[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [tripRes, daysRes] = await Promise.all([
        getSupabase().from("trips").select("*").eq("id", id).single(),
        getSupabase()
          .from("days")
          .select("*, zones(*)")
          .eq("trip_id", id)
          .order("position"),
      ]);
      setTrip(tripRes.data);
      setDays(daysRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <p className="text-purple-300">Chargement...</p>;
  if (!trip) return <p className="text-red-300">Voyage introuvable.</p>;

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
          className="btn-primary text-sm"
        >
          📅 Guide
        </Link>
        <Link
          href={`/trip/${id}/plan`}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-purple-200 transition-all hover:border-gold/30 hover:bg-white/10"
        >
          🗺️ Plan
        </Link>
      </div>

      <ul className="space-y-3">
        {days.map((day) => (
          <li key={day.id}>
            <Link
              href={`/trip/${id}/guide/day/${day.id}`}
              className="card card-hover block"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">
                  {day.name}
                </span>
                <span className="badge badge-pending">
                  {day.zones?.length ?? 0} zones
                </span>
              </div>
              <p className="mt-1 text-sm text-purple-300">
                {new Date(day.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {days.length === 0 && (
        <p className="text-center text-purple-300/60">Aucun jour dans le guide.</p>
      )}
    </div>
  );
}
