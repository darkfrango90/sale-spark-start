import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentMethod } from '@/types/sales';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SettingsContextType {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  addPaymentMethod: (name: string) => Promise<void>;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  getActivePaymentMethods: () => PaymentMethod[];
  refreshPaymentMethods: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const mappedMethods: PaymentMethod[] = (data || []).map(pm => ({
        id: pm.id,
        name: pm.name,
        active: pm.active,
        createdAt: new Date(pm.created_at)
      }));

      setPaymentMethods(mappedMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar condições de pagamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const getActivePaymentMethods = (): PaymentMethod[] => {
    return paymentMethods.filter(pm => pm.active);
  };

  const addPaymentMethod = async (name: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({ name, active: true });

      if (error) throw error;

      await fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  };

  const updatePaymentMethod = async (id: string, data: Partial<PaymentMethod>) => {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.active !== undefined) updateData.active = data.active;

      const { error } = await supabase
        .from('payment_methods')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{
      paymentMethods,
      loading,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      getActivePaymentMethods,
      refreshPaymentMethods: fetchPaymentMethods
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
