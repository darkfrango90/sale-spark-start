import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getNextProductCode: () => string;
  searchProductByCode: (code: string) => Product | undefined;
  searchProductsByName: (name: string) => Product[];
  getActiveProducts: () => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description || undefined,
        category: p.category || undefined,
        unit: p.unit,
        density: p.density ? Number(p.density) : undefined,
        costPrice: Number(p.cost_price),
        salePrice: Number(p.sale_price),
        stock: Number(p.stock),
        minStock: Number(p.min_stock),
        active: p.active,
        createdAt: new Date(p.created_at)
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getNextProductCode = (): string => {
    if (products.length === 0) return '001';
    const maxCode = Math.max(...products.map(p => parseInt(p.code, 10) || 0));
    return String(maxCode + 1).padStart(3, '0');
  };

  const searchProductByCode = (code: string): Product | undefined => {
    return products.find(p => p.code === code && p.active);
  };

  const searchProductsByName = (name: string): Product[] => {
    const searchTerm = name.toLowerCase();
    return products.filter(p => 
      p.active && p.name.toLowerCase().includes(searchTerm)
    );
  };

  const getActiveProducts = (): Product[] => {
    return products.filter(p => p.active);
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          code: productData.code,
          name: productData.name,
          description: productData.description || null,
          category: productData.category || null,
          unit: productData.unit,
          density: productData.density || null,
          cost_price: productData.costPrice,
          sale_price: productData.salePrice,
          stock: productData.stock,
          min_stock: productData.minStock,
          active: productData.active
        });

      if (error) throw error;

      await fetchProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updateData: any = {};
      if (productData.code !== undefined) updateData.code = productData.code;
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description || null;
      if (productData.category !== undefined) updateData.category = productData.category || null;
      if (productData.unit !== undefined) updateData.unit = productData.unit;
      if (productData.density !== undefined) updateData.density = productData.density || null;
      if (productData.costPrice !== undefined) updateData.cost_price = productData.costPrice;
      if (productData.salePrice !== undefined) updateData.sale_price = productData.salePrice;
      if (productData.stock !== undefined) updateData.stock = productData.stock;
      if (productData.minStock !== undefined) updateData.min_stock = productData.minStock;
      if (productData.active !== undefined) updateData.active = productData.active;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getNextProductCode,
      searchProductByCode,
      searchProductsByName,
      getActiveProducts,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
