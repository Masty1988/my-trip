export type Trip = {
  id: string;
  name: string;
  start_date: string;
  created_at: string;
};

export type Category = {
  id: string;
  trip_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Item = {
  id: string;
  category_id: string;
  name: string;
  checked: boolean;
  position: number;
  created_at: string;
};

export type Day = {
  id: string;
  trip_id: string;
  name: string;
  date: string;
  position: number;
  created_at: string;
};

export type Zone = {
  id: string;
  day_id: string;
  name: string;
  icon: string;
  position: number;
  created_at: string;
};

export type Suggestion = {
  id: string;
  zone_id: string;
  title: string;
  description: string | null;
  time_hint: string | null;
  position: number;
  created_at: string;
};

export type Attraction = {
  id: string;
  trip_id: string;
  name: string;
  zone: string;
  category: string;
  height_min: number | null;
  description: string | null;
  tips: string | null;
  is_priority: boolean;
  created_at: string;
};
