// Financial context for managing receiving accounts, accounts receivable, and accounts payable
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReceivingAccount, AccountReceivable, AccountPayable } from '@/types/financial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialContextType {
  // Receiving Accounts
  receivingAccounts: ReceivingAccount[];
  loadingAccounts: boolean;
  addReceivingAccount: (name: string) => Promise<void>;
  updateReceivingAccount: (id: string, data: Partial<ReceivingAccount>) => Promise<void>;
  deleteReceivingAccount: (id: string) => Promise<void>;
  getActiveReceivingAccounts: () => ReceivingAccount[];
  
  // Accounts Receivable
  accountsReceivable: AccountReceivable[];
  loadingReceivables: boolean;
  refreshAccountsReceivable: () => Promise<void>;
  confirmReceipt: (id: string, data: {
    receivingAccountId: string;
    interestPenalty: number;
    receiptDate: Date;
    confirmedBy?: 'manual' | 'ia';
  }) => Promise<void>;
  cancelReceipt: (id: string) => Promise<void>;

  // Accounts Payable
  accountsPayable: AccountPayable[];
  loadingPayables: boolean;
  refreshAccountsPayable: () => Promise<void>;
  addAccountPayable: (data: {
    supplierId: string;
    supplierCode: string;
    supplierName: string;
    competenceDate: Date;
    paymentType: 'boleto' | 'cheque_pre' | 'cartao_credito';
    invoiceNumber?: string;
    amount: number;
    dueDate: Date;
    daysBetween: number;
    installments: number;
  }) => Promise<void>;
  confirmPayment: (id: string, data: {
    payingAccountId: string;
    interestPenalty: number;
    paymentDate: Date;
  }) => Promise<void>;
  cancelPayment: (id: string) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [receivingAccounts, setReceivingAccounts] = useState<ReceivingAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [loadingReceivables, setLoadingReceivables] = useState(true);
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [loadingPayables, setLoadingPayables] = useState(true);
  const { toast } = useToast();

  // Fetch receiving accounts
  const fetchReceivingAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const { data, error } = await supabase
        .from('receiving_accounts')
        .select('*')
        .order('name');

      if (error) throw error;

      const mapped: ReceivingAccount[] = (data || []).map(acc => ({
        id: acc.id,
        name: acc.name,
        active: acc.active ?? true,
        createdAt: new Date(acc.created_at),
      }));

      setReceivingAccounts(mapped);
    } catch (error) {
      console.error('Error fetching receiving accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fetch accounts receivable
  const fetchAccountsReceivable = async () => {
    try {
      setLoadingReceivables(true);
      
      const { data: arData, error: arError } = await supabase
        .from('accounts_receivable')
        .select(`*, sales (number, customer_name, payment_method_name)`)
        .order('created_at', { ascending: false });

      if (arError) throw arError;

      const { data: raData } = await supabase.from('receiving_accounts').select('id, name');
      const raMap = new Map((raData || []).map(ra => [ra.id, ra.name]));

      const mapped: AccountReceivable[] = (arData || []).map(ar => ({
        id: ar.id,
        saleId: ar.sale_id,
        saleNumber: ar.sales?.number || '',
        customerName: ar.sales?.customer_name || '',
        paymentMethodName: ar.sales?.payment_method_name || '',
        originalAmount: Number(ar.original_amount),
        interestPenalty: Number(ar.interest_penalty) || 0,
        finalAmount: Number(ar.final_amount),
        status: ar.status as 'pendente' | 'recebido',
        receivingAccountId: ar.receiving_account_id || undefined,
        receivingAccountName: ar.receiving_account_id ? raMap.get(ar.receiving_account_id) : undefined,
        receiptDate: ar.receipt_date ? new Date(ar.receipt_date) : undefined,
        receiptUrl: ar.receipt_url || undefined,
        notes: ar.notes || undefined,
        confirmedBy: (ar as any).confirmed_by as 'manual' | 'ia' | undefined,
        createdAt: new Date(ar.created_at),
        updatedAt: new Date(ar.updated_at),
      }));

      setAccountsReceivable(mapped);
    } catch (error) {
      console.error('Error fetching accounts receivable:', error);
    } finally {
      setLoadingReceivables(false);
    }
  };

  // Fetch accounts payable
  const fetchAccountsPayable = async () => {
    try {
      setLoadingPayables(true);
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const { data: raData } = await supabase.from('receiving_accounts').select('id, name');
      const raMap = new Map((raData || []).map(ra => [ra.id, ra.name]));

      const mapped: AccountPayable[] = (data || []).map(ap => ({
        id: ap.id,
        supplierId: ap.supplier_id,
        supplierCode: ap.supplier_code,
        supplierName: ap.supplier_name,
        competenceDate: new Date(ap.competence_date),
        paymentType: ap.payment_type as 'boleto' | 'cheque_pre' | 'cartao_credito',
        invoiceNumber: ap.invoice_number || undefined,
        originalAmount: Number(ap.original_amount),
        interestPenalty: Number(ap.interest_penalty) || 0,
        finalAmount: Number(ap.final_amount),
        dueDate: new Date(ap.due_date),
        installmentNumber: ap.installment_number || 1,
        totalInstallments: ap.total_installments || 1,
        status: ap.status as 'pendente' | 'pago',
        paymentDate: ap.payment_date ? new Date(ap.payment_date) : undefined,
        payingAccountId: ap.paying_account_id || undefined,
        payingAccountName: ap.paying_account_id ? raMap.get(ap.paying_account_id) : undefined,
        notes: ap.notes || undefined,
        createdAt: new Date(ap.created_at),
        updatedAt: new Date(ap.updated_at),
      }));

      setAccountsPayable(mapped);
    } catch (error) {
      console.error('Error fetching accounts payable:', error);
    } finally {
      setLoadingPayables(false);
    }
  };

  useEffect(() => {
    fetchReceivingAccounts();
    fetchAccountsReceivable();
    fetchAccountsPayable();
  }, []);

  const addReceivingAccount = async (name: string) => {
    const { error } = await supabase.from('receiving_accounts').insert({ name });
    if (error) throw error;
    await fetchReceivingAccounts();
    toast({ title: "Sucesso", description: "Conta de recebimento adicionada." });
  };

  const updateReceivingAccount = async (id: string, data: Partial<ReceivingAccount>) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.active !== undefined) updateData.active = data.active;
    const { error } = await supabase.from('receiving_accounts').update(updateData).eq('id', id);
    if (error) throw error;
    await fetchReceivingAccounts();
  };

  const deleteReceivingAccount = async (id: string) => {
    const { error } = await supabase.from('receiving_accounts').delete().eq('id', id);
    if (error) throw error;
    await fetchReceivingAccounts();
    toast({ title: "Sucesso", description: "Conta de recebimento excluída." });
  };

  const getActiveReceivingAccounts = () => receivingAccounts.filter(acc => acc.active);

  const confirmReceipt = async (id: string, data: { receivingAccountId: string; interestPenalty: number; receiptDate: Date; confirmedBy?: 'manual' | 'ia' }) => {
    const ar = accountsReceivable.find(a => a.id === id);
    if (!ar) throw new Error('Conta a receber não encontrada');
    const finalAmount = ar.originalAmount + data.interestPenalty;
    await supabase.from('accounts_receivable').update({
      status: 'recebido', receiving_account_id: data.receivingAccountId,
      interest_penalty: data.interestPenalty, final_amount: finalAmount,
      receipt_date: data.receiptDate.toISOString().split('T')[0],
      confirmed_by: data.confirmedBy || 'manual',
    }).eq('id', id);
    await supabase.from('sales').update({ status: 'finalizado' }).eq('id', ar.saleId);
    await fetchAccountsReceivable();
    toast({ title: "Sucesso", description: "Recebimento confirmado." });
  };

  const cancelReceipt = async (id: string) => {
    const ar = accountsReceivable.find(a => a.id === id);
    if (!ar) throw new Error('Conta a receber não encontrada');
    await supabase.from('accounts_receivable').update({
      status: 'pendente', receiving_account_id: null, interest_penalty: 0,
      final_amount: ar.originalAmount, receipt_date: null,
    }).eq('id', id);
    await supabase.from('sales').update({ status: 'pendente' }).eq('id', ar.saleId);
    await fetchAccountsReceivable();
    toast({ title: "Sucesso", description: "Baixa cancelada." });
  };

  const addAccountPayable = async (data: {
    supplierId: string; supplierCode: string; supplierName: string;
    competenceDate: Date; paymentType: 'boleto' | 'cheque_pre' | 'cartao_credito';
    invoiceNumber?: string; amount: number; dueDate: Date; daysBetween: number; installments: number;
  }) => {
    const { amount, installments, dueDate, daysBetween, ...rest } = data;
    const baseAmount = Math.floor((amount / installments) * 100) / 100;
    const remainder = Math.round((amount - (baseAmount * (installments - 1))) * 100) / 100;
    
    const records = [];
    let currentDate = new Date(dueDate);
    
    for (let i = 1; i <= installments; i++) {
      const instAmount = i === installments ? remainder : baseAmount;
      records.push({
        supplier_id: rest.supplierId,
        supplier_code: rest.supplierCode,
        supplier_name: rest.supplierName,
        competence_date: rest.competenceDate.toISOString().split('T')[0],
        payment_type: rest.paymentType,
        invoice_number: rest.invoiceNumber || null,
        original_amount: instAmount,
        final_amount: instAmount,
        due_date: currentDate.toISOString().split('T')[0],
        installment_number: i,
        total_installments: installments,
      });
      currentDate.setDate(currentDate.getDate() + daysBetween);
    }

    const { error } = await supabase.from('accounts_payable').insert(records);
    if (error) throw error;
    await fetchAccountsPayable();
  };

  const confirmPayment = async (id: string, data: { payingAccountId: string; interestPenalty: number; paymentDate: Date; }) => {
    const ap = accountsPayable.find(a => a.id === id);
    if (!ap) throw new Error('Conta a pagar não encontrada');
    const finalAmount = ap.originalAmount + data.interestPenalty;
    const { error } = await supabase.from('accounts_payable').update({
      status: 'pago', paying_account_id: data.payingAccountId,
      interest_penalty: data.interestPenalty, final_amount: finalAmount,
      payment_date: data.paymentDate.toISOString().split('T')[0],
    }).eq('id', id);
    if (error) throw error;
    await fetchAccountsPayable();
    toast({ title: "Sucesso", description: "Pagamento confirmado." });
  };

  const cancelPayment = async (id: string) => {
    const ap = accountsPayable.find(a => a.id === id);
    if (!ap) throw new Error('Conta a pagar não encontrada');
    const { error } = await supabase.from('accounts_payable').update({
      status: 'pendente', paying_account_id: null, interest_penalty: 0,
      final_amount: ap.originalAmount, payment_date: null,
    }).eq('id', id);
    if (error) throw error;
    await fetchAccountsPayable();
    toast({ title: "Sucesso", description: "Pagamento cancelado." });
  };

  return (
    <FinancialContext.Provider value={{
      receivingAccounts, loadingAccounts, addReceivingAccount, updateReceivingAccount,
      deleteReceivingAccount, getActiveReceivingAccounts,
      accountsReceivable, loadingReceivables, refreshAccountsReceivable: fetchAccountsReceivable,
      confirmReceipt, cancelReceipt,
      accountsPayable, loadingPayables, refreshAccountsPayable: fetchAccountsPayable,
      addAccountPayable, confirmPayment, cancelPayment,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within a FinancialProvider');
  return context;
};
