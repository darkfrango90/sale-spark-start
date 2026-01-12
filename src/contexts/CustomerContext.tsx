import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getNextCustomerCode: () => string;
  getCustomerByCode: (code: string) => Customer | undefined;
  getCustomerByCpfCnpj: (cpfCnpj: string) => Customer | undefined;
  refreshCustomers: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;

      const mappedCustomers: Customer[] = (data || []).map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        type: c.type as 'fisica' | 'juridica',
        cpfCnpj: c.cpf_cnpj,
        phone: c.phone || '',
        email: c.email || undefined,
        city: c.city || undefined,
        state: c.state || undefined,
        notes: c.notes || undefined,
        active: c.active,
        createdAt: new Date(c.created_at)
      }));

      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getNextCustomerCode = (): string => {
    if (customers.length === 0) return '001';
    const maxCode = Math.max(...customers.map(c => parseInt(c.code, 10) || 0));
    return String(maxCode + 1).padStart(3, '0');
  };

  const getCustomerByCode = (code: string): Customer | undefined => {
    return customers.find(c => c.code === code);
  };

  const getCustomerByCpfCnpj = (cpfCnpj: string): Customer | undefined => {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');
    return customers.find(c => c.cpfCnpj.replace(/\D/g, '') === cleanCpfCnpj);
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          code: customerData.code,
          name: customerData.name,
          type: customerData.type,
          cpf_cnpj: customerData.cpfCnpj,
          phone: customerData.phone || null,
          email: customerData.email || null,
          city: customerData.city || null,
          state: customerData.state || null,
          notes: customerData.notes || null,
          active: customerData.active
        });

      if (error) throw error;

      await fetchCustomers();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const updateData: any = {};
      if (customerData.code !== undefined) updateData.code = customerData.code;
      if (customerData.name !== undefined) updateData.name = customerData.name;
      if (customerData.type !== undefined) updateData.type = customerData.type;
      if (customerData.cpfCnpj !== undefined) updateData.cpf_cnpj = customerData.cpfCnpj;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone || null;
      if (customerData.email !== undefined) updateData.email = customerData.email || null;
      if (customerData.city !== undefined) updateData.city = customerData.city || null;
      if (customerData.state !== undefined) updateData.state = customerData.state || null;
      if (customerData.notes !== undefined) updateData.notes = customerData.notes || null;
      if (customerData.active !== undefined) updateData.active = customerData.active;

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getNextCustomerCode,
        getCustomerByCode,
        getCustomerByCpfCnpj,
        refreshCustomers: fetchCustomers
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
