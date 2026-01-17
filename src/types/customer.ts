export interface Customer {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  type: 'fisica' | 'juridica';
  cpfCnpj: string;
  rgIe?: string;
  email?: string;
  phone: string;
  cellphone?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  birthDate?: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
  // Barter (Permuta) fields
  hasBarter?: boolean;
  barterCredit?: number;
  barterLimit?: number;
  barterNotes?: string;
}
