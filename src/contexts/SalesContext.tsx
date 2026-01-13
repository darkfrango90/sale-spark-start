import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale, SaleItem } from '@/types/sales';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalesContextType {
  sales: Sale[];
  loading: boolean;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Sale>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string, reason: string) => Promise<void>;
  getNextSaleNumber: () => string;
  getNextQuoteNumber: () => string;
  convertQuoteToSale: (quoteId: string) => Promise<Sale | undefined>;
  getSalesByType: (type: 'pedido' | 'orcamento') => Sale[];
  refreshSales: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      // Fetch sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Fetch all sale items
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*');

      if (itemsError) throw itemsError;

      const mappedSales: Sale[] = (salesData || []).map(s => {
        const saleItems: SaleItem[] = (itemsData || [])
          .filter(i => i.sale_id === s.id)
          .map(i => ({
            id: i.id,
            productId: i.product_id,
            productCode: i.product_code,
            productName: i.product_name,
            unit: i.unit,
            quantity: Number(i.quantity),
            originalPrice: Number(i.unit_price), // Para compatibilidade, usar unit_price como original
            unitPrice: Number(i.unit_price),
            discount: Number(i.discount),
            total: Number(i.total),
            density: i.density ? Number(i.density) : undefined,
            weight: i.weight ? Number(i.weight) : undefined
          }));

        return {
          id: s.id,
          type: s.type as 'pedido' | 'orcamento',
          number: s.number,
          customerId: s.customer_id,
          customerCode: s.customer_code,
          customerName: s.customer_name,
          customerCpfCnpj: s.customer_cpf_cnpj,
          customerPhone: s.customer_phone || undefined,
          customerAddress: s.customer_address || undefined,
          customerNeighborhood: s.customer_neighborhood || undefined,
          customerCity: s.customer_city || undefined,
          customerState: s.customer_state || undefined,
          customerZipCode: s.customer_zip_code || undefined,
          paymentMethodId: s.payment_method_id || '',
          paymentMethodName: s.payment_method_name || '',
          paymentType: (s.payment_type as 'vista' | 'prazo') || undefined,
          items: saleItems,
          subtotal: Number(s.subtotal),
          discount: Number(s.discount),
          total: Number(s.total),
          totalWeight: Number(s.total_weight),
          notes: s.notes || undefined,
          status: s.status as 'pendente' | 'finalizado' | 'cancelado' | 'excluido',
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at)
        };
      });

      setSales(mappedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar vendas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

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

  const addSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
    try {
      // Insert sale
      const { data: saleResult, error: saleError } = await supabase
        .from('sales')
        .insert({
          type: saleData.type,
          number: saleData.number,
          customer_id: saleData.customerId,
          customer_code: saleData.customerCode,
          customer_name: saleData.customerName,
          customer_cpf_cnpj: saleData.customerCpfCnpj,
          customer_phone: saleData.customerPhone || null,
          customer_address: saleData.customerAddress || null,
          customer_neighborhood: saleData.customerNeighborhood || null,
          customer_city: saleData.customerCity || null,
          customer_state: saleData.customerState || null,
          customer_zip_code: saleData.customerZipCode || null,
          payment_method_id: saleData.paymentMethodId || null,
          payment_method_name: saleData.paymentMethodName || null,
          payment_type: saleData.paymentType || null,
          subtotal: saleData.subtotal,
          discount: saleData.discount,
          total: saleData.total,
          total_weight: saleData.totalWeight,
          notes: saleData.notes || null,
          status: saleData.status
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      if (saleData.items.length > 0) {
        const itemsToInsert = saleData.items.map(item => ({
          sale_id: saleResult.id,
          product_id: item.productId,
          product_code: item.productCode,
          product_name: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          total: item.total,
          density: item.density || null,
          weight: item.weight || null
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchSales();

      // Return the created sale
      const newSale: Sale = {
        id: saleResult.id,
        type: saleResult.type as 'pedido' | 'orcamento',
        number: saleResult.number,
        customerId: saleResult.customer_id,
        customerCode: saleResult.customer_code,
        customerName: saleResult.customer_name,
        customerCpfCnpj: saleResult.customer_cpf_cnpj,
        customerPhone: saleResult.customer_phone || undefined,
        customerAddress: saleResult.customer_address || undefined,
        customerNeighborhood: saleResult.customer_neighborhood || undefined,
        customerCity: saleResult.customer_city || undefined,
        customerState: saleResult.customer_state || undefined,
        customerZipCode: saleResult.customer_zip_code || undefined,
        paymentMethodId: saleResult.payment_method_id || '',
        paymentMethodName: saleResult.payment_method_name || '',
        paymentType: (saleResult.payment_type as 'vista' | 'prazo') || undefined,
        items: saleData.items,
        subtotal: Number(saleResult.subtotal),
        discount: Number(saleResult.discount),
        total: Number(saleResult.total),
        totalWeight: Number(saleResult.total_weight),
        notes: saleResult.notes || undefined,
        status: saleResult.status as 'pendente' | 'finalizado' | 'cancelado' | 'excluido',
        createdAt: new Date(saleResult.created_at),
        updatedAt: new Date(saleResult.updated_at)
      };

      return newSale;
    } catch (error: any) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const updateSale = async (id: string, saleData: Partial<Sale>) => {
    try {
      const updateData: any = {};
      if (saleData.status !== undefined) updateData.status = saleData.status;
      if (saleData.notes !== undefined) updateData.notes = saleData.notes;

      const { error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchSales();
    } catch (error: any) {
      console.error('Error updating sale:', error);
      throw error;
    }
  };

  // Soft delete - marca como cancelado com motivo de exclusão
  const deleteSale = async (id: string, reason: string) => {
    try {
      const sale = sales.find(s => s.id === id);
      
      if (sale) {
        // Record the deletion with reason (se a tabela existir)
        try {
          await supabase
            .from('sales_deletions')
            .insert({
              sale_id: id,
              sale_number: sale.number,
              sale_type: sale.type,
              customer_name: sale.customerName,
              total: sale.total,
              reason: reason
            });
        } catch (e) {
          // Tabela pode não existir, ignorar
          console.log('sales_deletions table may not exist');
        }
      }

      // Usa status 'cancelado' com motivo de exclusão nas notas
      const currentNotes = sale?.notes || '';
      const newNotes = currentNotes 
        ? `${currentNotes}\n\n[EXCLUÍDO]: ${reason}` 
        : `[EXCLUÍDO]: ${reason}`;

      const { error } = await supabase
        .from('sales')
        .update({ 
          status: 'cancelado',
          notes: newNotes
        })
        .eq('id', id);

      if (error) throw error;

      await fetchSales();
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  };

  const convertQuoteToSale = async (quoteId: string): Promise<Sale | undefined> => {
    const quote = sales.find(s => s.id === quoteId && s.type === 'orcamento');
    if (!quote) return undefined;

    const newSaleNumber = getNextSaleNumber();
    
    const newSale = await addSale({
      ...quote,
      type: 'pedido',
      number: newSaleNumber,
      status: 'pendente',
      totalWeight: quote.totalWeight
    });

    // Mark quote as converted
    await updateSale(quoteId, { status: 'finalizado' });
    
    return newSale;
  };

  const getSalesByType = (type: 'pedido' | 'orcamento'): Sale[] => {
    return sales.filter(s => s.type === type);
  };

  return (
    <SalesContext.Provider value={{
      sales,
      loading,
      addSale,
      updateSale,
      deleteSale,
      getNextSaleNumber,
      getNextQuoteNumber,
      convertQuoteToSale,
      getSalesByType,
      refreshSales: fetchSales
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
