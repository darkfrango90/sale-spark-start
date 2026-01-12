import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanySettings {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

interface CompanyContextType {
  company: CompanySettings | null;
  loading: boolean;
  updateCompany: (data: Omit<CompanySettings, 'id'>) => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompany = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompany({
          id: data.id,
          name: data.name || '',
          cnpj: data.cnpj || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zip_code || '',
          phone: data.phone || '',
          email: data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const updateCompany = async (data: Omit<CompanySettings, 'id'>) => {
    try {
      const dbData = {
        name: data.name,
        cnpj: data.cnpj,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        phone: data.phone,
        email: data.email
      };

      if (company?.id) {
        // Update existing
        const { error } = await supabase
          .from('company_settings')
          .update(dbData)
          .eq('id', company.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('company_settings')
          .insert(dbData);

        if (error) throw error;
      }

      await fetchCompany();

      toast({
        title: "Sucesso",
        description: "Dados da empresa salvos com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving company settings:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar dados da empresa.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <CompanyContext.Provider value={{
      company,
      loading,
      updateCompany,
      refreshCompany: fetchCompany
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
