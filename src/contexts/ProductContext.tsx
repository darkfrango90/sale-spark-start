import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getNextProductCode: () => string;
  searchProductByCode: (code: string) => Product | undefined;
  searchProductsByName: (name: string) => Product[];
  getActiveProducts: () => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('products');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: Product) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const getNextProductCode = (): string => {
    if (products.length === 0) return '001';
    
    const codes = products.map(p => parseInt(p.code)).filter(n => !isNaN(n));
    const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
    return String(maxCode + 1).padStart(3, '0');
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
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

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getNextProductCode,
      searchProductByCode,
      searchProductsByName,
      getActiveProducts
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
