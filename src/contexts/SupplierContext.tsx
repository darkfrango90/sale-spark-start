import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Supplier } from '@/types/supplier';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getNextSupplierCode: () => string;
  getSupplierByCode: (code: string) => Supplier | undefined;
  getSupplierByCpfCnpj: (cpfCnpj: string) => Supplier | undefined;
  refreshSuppliers: () => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider = ({ children }: { children: ReactNode }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;

      const mappedSuppliers: Supplier[] = (data || []).map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        tradeName: s.trade_name || undefined,
        type: s.type as 'fisica' | 'juridica',
        cpfCnpj: s.cpf_cnpj,
        rgIe: s.rg_ie || undefined,
        phone: s.phone || '',
        cellphone: s.cellphone || undefined,
        email: s.email || undefined,
        zipCode: s.zip_code || undefined,
        street: s.street || undefined,
        number: s.number || undefined,
        complement: s.complement || undefined,
        neighborhood: s.neighborhood || undefined,
        city: s.city || undefined,
        state: s.state || undefined,
        birthDate: s.birth_date || undefined,
        notes: s.notes || undefined,
        active: s.active ?? true,
        createdAt: new Date(s.created_at)
      }));

      setSuppliers(mappedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar fornecedores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getNextSupplierCode = (): string => {
    if (suppliers.length === 0) return '001';
    const maxCode = Math.max(...suppliers.map(s => parseInt(s.code, 10) || 0));
    return String(maxCode + 1).padStart(3, '0');
  };

  const getSupplierByCode = (code: string): Supplier | undefined => {
    return suppliers.find(s => s.code === code);
  };

  const getSupplierByCpfCnpj = (cpfCnpj: string): Supplier | undefined => {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');
    return suppliers.find(s => s.cpfCnpj.replace(/\D/g, '') === cleanCpfCnpj);
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert({
          code: supplierData.code,
          name: supplierData.name,
          trade_name: supplierData.tradeName || null,
          type: supplierData.type,
          cpf_cnpj: supplierData.cpfCnpj,
          rg_ie: supplierData.rgIe || null,
          phone: supplierData.phone || null,
          cellphone: supplierData.cellphone || null,
          email: supplierData.email || null,
          zip_code: supplierData.zipCode || null,
          street: supplierData.street || null,
          number: supplierData.number || null,
          complement: supplierData.complement || null,
          neighborhood: supplierData.neighborhood || null,
          city: supplierData.city || null,
          state: supplierData.state || null,
          birth_date: supplierData.birthDate || null,
          notes: supplierData.notes || null,
          active: supplierData.active
        });

      if (error) throw error;

      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updateData: any = {};
      if (supplierData.code !== undefined) updateData.code = supplierData.code;
      if (supplierData.name !== undefined) updateData.name = supplierData.name;
      if (supplierData.tradeName !== undefined) updateData.trade_name = supplierData.tradeName || null;
      if (supplierData.type !== undefined) updateData.type = supplierData.type;
      if (supplierData.cpfCnpj !== undefined) updateData.cpf_cnpj = supplierData.cpfCnpj;
      if (supplierData.rgIe !== undefined) updateData.rg_ie = supplierData.rgIe || null;
      if (supplierData.phone !== undefined) updateData.phone = supplierData.phone || null;
      if (supplierData.cellphone !== undefined) updateData.cellphone = supplierData.cellphone || null;
      if (supplierData.email !== undefined) updateData.email = supplierData.email || null;
      if (supplierData.zipCode !== undefined) updateData.zip_code = supplierData.zipCode || null;
      if (supplierData.street !== undefined) updateData.street = supplierData.street || null;
      if (supplierData.number !== undefined) updateData.number = supplierData.number || null;
      if (supplierData.complement !== undefined) updateData.complement = supplierData.complement || null;
      if (supplierData.neighborhood !== undefined) updateData.neighborhood = supplierData.neighborhood || null;
      if (supplierData.city !== undefined) updateData.city = supplierData.city || null;
      if (supplierData.state !== undefined) updateData.state = supplierData.state || null;
      if (supplierData.birthDate !== undefined) updateData.birth_date = supplierData.birthDate || null;
      if (supplierData.notes !== undefined) updateData.notes = supplierData.notes || null;
      if (supplierData.active !== undefined) updateData.active = supplierData.active;

      const { error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getNextSupplierCode,
        getSupplierByCode,
        getSupplierByCpfCnpj,
        refreshSuppliers: fetchSuppliers
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};
