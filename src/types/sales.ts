export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  type: 'pedido' | 'orcamento';
  number: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerCpfCnpj: string;
  paymentMethodId: string;
  paymentMethodName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'pendente' | 'finalizado' | 'cancelado';
  createdAt: Date;
  updatedAt: Date;
}
