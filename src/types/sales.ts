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
  originalPrice: number; // Preço cadastrado do produto
  unitPrice: number; // Preço praticado (editável)
  discount: number; // Em R$ (calculado automaticamente: originalPrice - unitPrice * quantity)
  total: number;
  density?: number; // Densidade do produto (Kg/m³)
  weight?: number; // Peso calculado (Kg)
}

export interface Sale {
  id: string;
  type: 'pedido' | 'orcamento';
  number: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerCpfCnpj: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNeighborhood?: string;
  customerCity?: string;
  customerState?: string;
  customerZipCode?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalWeight: number; // Peso total em Kg
  notes?: string;
  status: 'pendente' | 'finalizado' | 'cancelado' | 'excluido';
  paymentType?: 'vista' | 'prazo'; // Forma de pagamento
  createdAt: Date;
  updatedAt: Date;
}
