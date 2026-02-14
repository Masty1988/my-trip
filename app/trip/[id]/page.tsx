"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Trip, Category, Item } from "@/lib/types";

type CategoryWithItems = Category & { items: Item[] };

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [tripRes, catRes] = await Promise.all([
        getSupabase().from("trips").select("*").eq("id", id).single(),
        getSupabase()
          .from("categories")
          .select("*, items(*)")
          .eq("trip_id", id)
          .order("position"),
      ]);
      setTrip(tripRes.data);
      setCategories(catRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <p className="text-purple-300">Chargement...</p>;
  if (!trip) return <p className="text-red-300">Voyage introuvable.</p>;

  return (
    <div>
      <Link href="/" className="text-sm text-purple-300 hover:text-gold">
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

      <ul className="space-y-3">
        {categories.map((cat) => {
          const checked = cat.items.filter((i) => i.checked).length;
          const total = cat.items.length;
          const allDone = total > 0 && checked === total;

          return (
            <li key={cat.id}>
              <Link
                href={`/trip/${id}/category/${cat.id}`}
                className="card card-hover flex items-center justify-between"
              >
                <span className="text-lg font-semibold text-white">
                  {cat.name}
                </span>
                <span className={`badge ${allDone ? "badge-done" : "badge-pending"}`}>
                  {checked}/{total}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
