import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReceivingAccount, AccountReceivable } from '@/types/financial';
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
  }) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [receivingAccounts, setReceivingAccounts] = useState<ReceivingAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [loadingReceivables, setLoadingReceivables] = useState(true);
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
      toast({
        title: "Erro",
        description: "Falha ao carregar contas de recebimento.",
        variant: "destructive"
      });
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fetch accounts receivable
  const fetchAccountsReceivable = async () => {
    try {
      setLoadingReceivables(true);
      
      // Fetch accounts receivable with sale data
      const { data: arData, error: arError } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          sales (
            number,
            customer_name,
            payment_method_name
          )
        `)
        .order('created_at', { ascending: false });

      if (arError) throw arError;

      // Fetch receiving accounts to map names
      const { data: raData } = await supabase
        .from('receiving_accounts')
        .select('id, name');

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
        createdAt: new Date(ar.created_at),
        updatedAt: new Date(ar.updated_at),
      }));

      setAccountsReceivable(mapped);
    } catch (error) {
      console.error('Error fetching accounts receivable:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar contas a receber.",
        variant: "destructive"
      });
    } finally {
      setLoadingReceivables(false);
    }
  };

  useEffect(() => {
    fetchReceivingAccounts();
    fetchAccountsReceivable();
  }, []);

  const addReceivingAccount = async (name: string) => {
    try {
      const { error } = await supabase
        .from('receiving_accounts')
        .insert({ name });

      if (error) throw error;

      await fetchReceivingAccounts();
      toast({
        title: "Sucesso",
        description: "Conta de recebimento adicionada.",
      });
    } catch (error: any) {
      console.error('Error adding receiving account:', error);
      throw error;
    }
  };

  const updateReceivingAccount = async (id: string, data: Partial<ReceivingAccount>) => {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.active !== undefined) updateData.active = data.active;

      const { error } = await supabase
        .from('receiving_accounts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchReceivingAccounts();
    } catch (error: any) {
      console.error('Error updating receiving account:', error);
      throw error;
    }
  };

  const deleteReceivingAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('receiving_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchReceivingAccounts();
      toast({
        title: "Sucesso",
        description: "Conta de recebimento excluída.",
      });
    } catch (error: any) {
      console.error('Error deleting receiving account:', error);
      throw error;
    }
  };

  const getActiveReceivingAccounts = () => {
    return receivingAccounts.filter(acc => acc.active);
  };

  const confirmReceipt = async (id: string, data: {
    receivingAccountId: string;
    interestPenalty: number;
    receiptDate: Date;
  }) => {
    try {
      const ar = accountsReceivable.find(a => a.id === id);
      if (!ar) throw new Error('Conta a receber não encontrada');

      const finalAmount = ar.originalAmount + data.interestPenalty;

      // Update accounts_receivable
      const { error: arError } = await supabase
        .from('accounts_receivable')
        .update({
          status: 'recebido',
          receiving_account_id: data.receivingAccountId,
          interest_penalty: data.interestPenalty,
          final_amount: finalAmount,
          receipt_date: data.receiptDate.toISOString().split('T')[0],
        })
        .eq('id', id);

      if (arError) throw arError;

      // Update sale status to 'finalizado'
      const { error: saleError } = await supabase
        .from('sales')
        .update({ status: 'finalizado' })
        .eq('id', ar.saleId);

      if (saleError) throw saleError;

      await fetchAccountsReceivable();
      toast({
        title: "Sucesso",
        description: "Recebimento confirmado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error confirming receipt:', error);
      throw error;
    }
  };

  return (
    <FinancialContext.Provider value={{
      receivingAccounts,
      loadingAccounts,
      addReceivingAccount,
      updateReceivingAccount,
      deleteReceivingAccount,
      getActiveReceivingAccounts,
      accountsReceivable,
      loadingReceivables,
      refreshAccountsReceivable: fetchAccountsReceivable,
      confirmReceipt,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
