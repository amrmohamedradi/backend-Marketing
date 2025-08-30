// TypeScript types for Spec CRUD
export interface SpecItem {
  label: string;
  value?: string;
  price?: number;
}

export interface LocalizedName {
  ar?: string;
  en?: string;
}

export interface SpecPayload {
  title: string;
  name: string | LocalizedName;
  items: SpecItem[];
  meta?: Record<string, any>;
}

export interface SpecDocument {
  id: string;
  data: SpecPayload;
  updatedAt: Date;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  id?: string;
  spec?: T;
  error?: string;
  details?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}
