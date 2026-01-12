import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale } from '@/types/sales';

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Sale;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getNextSaleNumber: () => string;
  getNextQuoteNumber: () => string;
  convertQuoteToSale: (quoteId: string) => Sale | undefined;
  getSalesByType: (type: 'pedido' | 'orcamento') => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem('sales');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: Sale) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const getNextSaleNumber = (): string => {
    const pedidos = sales.filter(s => s.type === 'pedido');
    if (pedidos.length === 0) return '00001';
    
    const numbers = pedidos.map(s => parseInt(s.number)).filter(n => !isNaN(n));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return String(maxNumber + 1).padStart(5, '0');
  };

  const getNextQuoteNumber = (): string => {
    const orcamentos = sales.filter(s => s.type === 'orcamento');
    if (orcamentos.length === 0) return 'ORC-00001';
    
    const numbers = orcamentos.map(s => {
      const match = s.number.match(/ORC-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }).filter(n => !isNaN(n));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `ORC-${String(maxNumber + 1).padStart(5, '0')}`;
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Sale => {
    const now = new Date();
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    setSales(prev => [...prev, newSale]);
    return newSale;
  };

  const updateSale = (id: string, saleData: Partial<Sale>) => {
    setSales(prev => 
      prev.map(sale => 
        sale.id === id ? { ...sale, ...saleData, updatedAt: new Date() } : sale
      )
    );
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  const convertQuoteToSale = (quoteId: string): Sale | undefined => {
    const quote = sales.find(s => s.id === quoteId && s.type === 'orcamento');
    if (!quote) return undefined;

    const newSaleNumber = getNextSaleNumber();
    const now = new Date();
    
    const newSale: Sale = {
      ...quote,
      id: crypto.randomUUID(),
      type: 'pedido',
      number: newSaleNumber,
      status: 'pendente',
      createdAt: now,
      updatedAt: now
    };

    setSales(prev => [...prev, newSale]);
    
    // Mark quote as converted (finalizado)
    updateSale(quoteId, { status: 'finalizado' });
    
    return newSale;
  };

  const getSalesByType = (type: 'pedido' | 'orcamento'): Sale[] => {
    return sales.filter(s => s.type === type);
  };

  return (
    <SalesContext.Provider value={{
      sales,
      addSale,
      updateSale,
      deleteSale,
      getNextSaleNumber,
      getNextQuoteNumber,
      convertQuoteToSale,
      getSalesByType
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
