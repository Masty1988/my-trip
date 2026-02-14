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
