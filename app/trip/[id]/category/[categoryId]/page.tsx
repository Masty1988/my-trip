"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Category, Item } from "@/lib/types";

export default function CategoryPage() {
  const { id, categoryId } = useParams<{ id: string; categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [catRes, itemsRes] = await Promise.all([
        getSupabase().from("categories").select("*").eq("id", categoryId).single(),
        getSupabase()
          .from("items")
          .select("*")
          .eq("category_id", categoryId)
          .order("position"),
      ]);
      setCategory(catRes.data);
      setItems(itemsRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, [categoryId]);

  // Realtime subscription for items
  useEffect(() => {
    const channel = getSupabase()
      .channel(`items-${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
          filter: `category_id=eq.${categoryId}`,
        },
        (payload) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id ? (payload.new as Item) : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [categoryId]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    const position = items.length;
    const { data } = await getSupabase()
      .from("items")
      .insert({ category_id: categoryId, name, position })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
    setNewItemName("");
  }

  async function toggleItem(item: Item) {
    const newChecked = !item.checked;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i))
    );
    await getSupabase().from("items").update({ checked: newChecked }).eq("id", item.id);
  }

  if (loading) return <p className="text-purple-300">Chargement...</p>;
  if (!category) return <p className="text-red-300">Catégorie introuvable.</p>;

  const checked = items.filter((i) => i.checked).length;

  return (
    <div>
      <Link
        href={`/trip/${id}`}
        className="text-sm text-purple-300 hover:text-gold"
      >
        ← Retour
      </Link>
      <h1 className="mt-4 mb-1 text-2xl font-bold text-white">
        {category.name}
      </h1>
      <p className="mb-6 text-sm text-purple-300">
        {checked}/{items.length} complétés
      </p>

      <form onSubmit={addItem} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Ajouter un item..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-purple-300/50 backdrop-blur-sm focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="btn-primary text-sm disabled:opacity-40"
        >
          Ajouter
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => toggleItem(item)}
            className="card flex cursor-pointer items-center gap-3 select-none"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item)}
              onClick={(e) => e.stopPropagation()}
            />
            <span
              className={
                item.checked
                  ? "text-purple-400/50 line-through"
                  : "text-white"
              }
            >
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
