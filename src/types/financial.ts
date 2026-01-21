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
  confirmedBy?: 'manual' | 'ia';
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountPayable {
  id: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  competenceDate: Date;
  paymentType: 'boleto' | 'cheque_pre' | 'cartao_credito';
  invoiceNumber?: string;
  originalAmount: number;
  interestPenalty: number;
  finalAmount: number;
  dueDate: Date;
  installmentNumber: number;
  totalInstallments: number;
  status: 'pendente' | 'pago';
  paymentDate?: Date;
  payingAccountId?: string;
  payingAccountName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
