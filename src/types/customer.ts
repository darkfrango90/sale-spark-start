export interface Customer {
  id: string;
  code: string;
  name: string;
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
}
