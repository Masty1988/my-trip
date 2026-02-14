"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Trip } from "@/lib/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      const { data } = await getSupabase()
        .from("trips")
        .select("*")
        .order("start_date", { ascending: true });
      setTrips(data ?? []);
      setLoading(false);
    }
    fetchTrips();
  }, []);

  if (loading) return <p className="text-purple-300">Chargement...</p>;

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">✨🏰✨</div>
        <h1 className="text-3xl font-bold text-white">Mes voyages</h1>
      </div>

      {trips.length === 0 ? (
        <p className="text-center text-purple-300">Aucun voyage pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link href={`/trip/${trip.id}`} className="card card-hover block">
                <span className="text-lg font-semibold text-white">
                  {trip.name}
                </span>
                <span className="ml-3 text-sm text-purple-300">
                  {new Date(trip.start_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
