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
        tradeName: c.trade_name || undefined,
        type: c.type as 'fisica' | 'juridica',
        cpfCnpj: c.cpf_cnpj,
        rgIe: c.rg_ie || undefined,
        phone: c.phone || '',
        cellphone: c.cellphone || undefined,
        email: c.email || undefined,
        zipCode: c.zip_code || undefined,
        street: c.street || undefined,
        number: c.number || undefined,
        complement: c.complement || undefined,
        neighborhood: c.neighborhood || undefined,
        city: c.city || undefined,
        state: c.state || undefined,
        birthDate: c.birth_date || undefined,
        notes: c.notes || undefined,
        active: c.active,
        createdAt: new Date(c.created_at),
        hasBarter: c.has_barter || false,
        barterCredit: c.barter_credit || 0,
        barterLimit: c.barter_limit || 0,
        barterNotes: c.barter_notes || undefined
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
          trade_name: customerData.tradeName || null,
          type: customerData.type,
          cpf_cnpj: customerData.cpfCnpj,
          rg_ie: customerData.rgIe || null,
          phone: customerData.phone || null,
          cellphone: customerData.cellphone || null,
          email: customerData.email || null,
          zip_code: customerData.zipCode || null,
          street: customerData.street || null,
          number: customerData.number || null,
          complement: customerData.complement || null,
          neighborhood: customerData.neighborhood || null,
          city: customerData.city || null,
          state: customerData.state || null,
          birth_date: customerData.birthDate || null,
          notes: customerData.notes || null,
          active: customerData.active,
          has_barter: customerData.hasBarter || false,
          barter_credit: customerData.barterCredit || 0,
          barter_limit: customerData.barterLimit || 0,
          barter_notes: customerData.barterNotes || null
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
      if (customerData.tradeName !== undefined) updateData.trade_name = customerData.tradeName || null;
      if (customerData.type !== undefined) updateData.type = customerData.type;
      if (customerData.cpfCnpj !== undefined) updateData.cpf_cnpj = customerData.cpfCnpj;
      if (customerData.rgIe !== undefined) updateData.rg_ie = customerData.rgIe || null;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone || null;
      if (customerData.cellphone !== undefined) updateData.cellphone = customerData.cellphone || null;
      if (customerData.email !== undefined) updateData.email = customerData.email || null;
      if (customerData.zipCode !== undefined) updateData.zip_code = customerData.zipCode || null;
      if (customerData.street !== undefined) updateData.street = customerData.street || null;
      if (customerData.number !== undefined) updateData.number = customerData.number || null;
      if (customerData.complement !== undefined) updateData.complement = customerData.complement || null;
      if (customerData.neighborhood !== undefined) updateData.neighborhood = customerData.neighborhood || null;
      if (customerData.city !== undefined) updateData.city = customerData.city || null;
      if (customerData.state !== undefined) updateData.state = customerData.state || null;
      if (customerData.birthDate !== undefined) updateData.birth_date = customerData.birthDate || null;
      if (customerData.notes !== undefined) updateData.notes = customerData.notes || null;
      if (customerData.active !== undefined) updateData.active = customerData.active;
      if (customerData.hasBarter !== undefined) updateData.has_barter = customerData.hasBarter;
      if (customerData.barterCredit !== undefined) updateData.barter_credit = customerData.barterCredit;
      if (customerData.barterLimit !== undefined) updateData.barter_limit = customerData.barterLimit;
      if (customerData.barterNotes !== undefined) updateData.barter_notes = customerData.barterNotes || null;

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
