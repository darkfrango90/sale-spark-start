import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '@/types/customer';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getNextCustomerCode: () => string;
  getCustomerByCode: (code: string) => Customer | undefined;
  getCustomerByCpfCnpj: (cpfCnpj: string) => Customer | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const STORAGE_KEY = 'cezar_customers';

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((c: Customer) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  const getNextCustomerCode = (): string => {
    if (customers.length === 0) return '001';
    const maxCode = Math.max(...customers.map(c => parseInt(c.code, 10)));
    return String(maxCode + 1).padStart(3, '0');
  };

  const getCustomerByCode = (code: string): Customer | undefined => {
    return customers.find(c => c.code === code);
  };

  const getCustomerByCpfCnpj = (cpfCnpj: string): Customer | undefined => {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');
    return customers.find(c => c.cpfCnpj.replace(/\D/g, '') === cleanCpfCnpj);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === id ? { ...customer, ...customerData } : customer
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getNextCustomerCode,
        getCustomerByCode,
        getCustomerByCpfCnpj
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
