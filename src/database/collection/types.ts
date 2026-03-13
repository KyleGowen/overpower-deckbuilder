export interface Collection {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CollectionCard {
  id: string;
  collection_id: string;
  card_id: string;
  card_type: string;
  quantity: number;
  image_path: string;
  created_at: Date;
  updated_at: Date;
}

export interface CollectionCardWithDetails extends CollectionCard {
  card_name?: string;
  card_data?: Record<string, unknown>;
  set?: string; // Renamed from universe
}

export interface CollectionHistory {
  id: string;
  collection_id: string;
  card_id: string;
  action: 'ADD' | 'REMOVE';
  new_quantity: number;
  created_at: Date;
}
