export interface ReceivingAccount {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
}

export interface AccountReceivable {
  id: string;
  saleId: string;
  saleNumber: string;
  customerName: string;
  paymentMethodName: string;
  originalAmount: number;
  interestPenalty: number;
  finalAmount: number;
  status: 'pendente' | 'recebido';
  receivingAccountId?: string;
  receivingAccountName?: string;
  receiptDate?: Date;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
