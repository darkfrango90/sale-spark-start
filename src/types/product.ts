export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock?: number;
  active: boolean;
  createdAt: Date;
}

export const unitOptions = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'MT', label: 'MT - Metro' },
  { value: 'LT', label: 'LT - Litro' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'PC', label: 'PC - Peça' },
  { value: 'ML', label: 'ML - Mililitro' },
  { value: 'M2', label: 'M² - Metro Quadrado' },
  { value: 'M3', label: 'M³ - Metro Cúbico' },
];
