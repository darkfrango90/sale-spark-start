import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentMethod } from '@/types/sales';

const defaultPaymentMethods: Omit<PaymentMethod, 'id' | 'createdAt'>[] = [
  { name: 'Pix', active: true },
  { name: 'Cartão de Crédito', active: true },
  { name: 'Cartão de Débito', active: true },
  { name: 'Cheque à Vista', active: true },
  { name: 'Cheque a Prazo', active: true },
  { name: 'Transferência BB', active: true },
  { name: 'Dinheiro', active: true },
  { name: 'À Prazo', active: true },
];

interface SettingsContextType {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => PaymentMethod;
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  getActivePaymentMethods: () => PaymentMethod[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const stored = localStorage.getItem('paymentMethods');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: PaymentMethod) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    }
    // Initialize with default payment methods
    return defaultPaymentMethods.map(method => ({
      ...method,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }));
  });

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const addPaymentMethod = (methodData: Omit<PaymentMethod, 'id' | 'createdAt'>): PaymentMethod => {
    const newMethod: PaymentMethod = {
      ...methodData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setPaymentMethods(prev => [...prev, newMethod]);
    return newMethod;
  };

  const updatePaymentMethod = (id: string, methodData: Partial<PaymentMethod>) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, ...methodData } : method
      )
    );
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const getActivePaymentMethods = (): PaymentMethod[] => {
    return paymentMethods.filter(m => m.active);
  };

  return (
    <SettingsContext.Provider value={{
      paymentMethods,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      getActivePaymentMethods
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
