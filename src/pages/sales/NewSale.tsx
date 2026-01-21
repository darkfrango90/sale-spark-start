import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Trash2, ShoppingCart, Upload, X } from "lucide-react";
import { useSales } from "@/contexts/SalesContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sale, SaleItem } from "@/types/sales";
import { Customer } from "@/types/customer";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import SalePrintView from "@/components/sales/SalePrintView";
import { supabase } from "@/integrations/supabase/client";

// Condições de pagamento
const conditionsAVista = ['Dinheiro', 'PIX', 'Deposito'];
const conditionsAPrazo = ['Boleto', 'Cartão no Crédito', 'Carteira', 'Permuta', 'Cartão de Débito'];

const NewSale = () => {
  const navigate = useNavigate();
  const { addSale, getNextSaleNumber, getNextQuoteNumber } = useSales();
  const { getActivePaymentMethods } = useSettings();
  const { customers } = useCustomers();
  const { searchProductByCode, searchProductsByName } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();

  const [saleType, setSaleType] = useState<'pedido' | 'orcamento'>('pedido');
  const [saleNumber, setSaleNumber] = useState('');
  
  // Customer
  const [customerCode, setCustomerCode] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  
  // Product
  const [productCode, setProductCode] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Items
  const [items, setItems] = useState<SaleItem[]>([]);
  
  // Payment - Nova estrutura
  const [paymentType, setPaymentType] = useState<'vista' | 'prazo'>('vista');
  const [paymentCondition, setPaymentCondition] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt/Proof
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Print
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [savedSale, setSavedSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (saleType === 'pedido') {
      setSaleNumber(getNextSaleNumber());
    } else {
      setSaleNumber(getNextQuoteNumber());
    }
  }, [saleType, getNextSaleNumber, getNextQuoteNumber]);

  // Reset condição de pagamento quando mudar o tipo
  useEffect(() => {
    setPaymentCondition('');
  }, [paymentType]);

  // Filtro de clientes - busca a partir de 1 caractere
  const filteredCustomers = customerSearch.length >= 1 
    ? customers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.code.includes(customerSearch)
      )
    : [];

  const handleCustomerCodeSearch = () => {
    const customer = customers.find(c => c.code === customerCode);
    if (customer) {
      setSelectedCustomer(customer);
      toast({
        title: "Cliente encontrado",
        description: customer.name,
      });
    } else {
      toast({
        title: "Cliente não encontrado",
        description: "Nenhum cliente com este código.",
        variant: "destructive",
      });
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerCode(customer.code);
    setCustomerSearch('');
    setCustomerPopoverOpen(false);
  };

  const handleProductCodeSearch = () => {
    const product = searchProductByCode(productCode);
    if (product) {
      addProductToItems(product);
      setProductCode('');
    } else {
      toast({
        title: "Produto não encontrado",
        description: "Nenhum produto ativo com este código.",
        variant: "destructive",
      });
    }
  };

  // Busca a partir de 1 caractere
  const handleProductSearch = (search: string) => {
    setProductSearch(search);
    if (search.length >= 1) {
      setFilteredProducts(searchProductsByName(search));
      setProductPopoverOpen(true);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSelectProduct = (product: Product) => {
    addProductToItems(product);
    setProductSearch('');
    setProductPopoverOpen(false);
    setFilteredProducts([]);
  };

  const calculateItemWeight = (quantity: number, unit: string, density?: number): number => {
    if ((unit === 'M³' || unit === 'M3') && density) {
      return quantity * density;
    } else if (unit === 'KG') {
      return quantity;
    }
    return 0;
  };

  const addProductToItems = (product: Product) => {
    const existingIndex = items.findIndex(i => i.productId === product.id);
    
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      const item = updatedItems[existingIndex];
      const newQuantity = item.quantity + 1;
      const newTotal = newQuantity * item.unitPrice;
      const newDiscount = (item.originalPrice - item.unitPrice) * newQuantity;
      const newWeight = calculateItemWeight(newQuantity, item.unit, item.density);
      updatedItems[existingIndex] = {
        ...item,
        quantity: newQuantity,
        discount: Math.max(0, newDiscount),
        total: newTotal,
        weight: newWeight
      };
      setItems(updatedItems);
    } else {
      const weight = calculateItemWeight(1, product.unit, product.density);
      const newItem: SaleItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        unit: product.unit,
        quantity: 1,
        originalPrice: product.salePrice,
        unitPrice: product.salePrice,
        discount: 0,
        total: product.salePrice,
        density: product.density,
        weight: weight,
      };
      setItems([...items, newItem]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newTotal = quantity * item.unitPrice;
        const newDiscount = (item.originalPrice - item.unitPrice) * quantity;
        const newWeight = calculateItemWeight(quantity, item.unit, item.density);
        return { ...item, quantity, discount: Math.max(0, newDiscount), total: newTotal, weight: newWeight };
      }
      return item;
    }));
  };

  // Nova função para atualizar o preço praticado
  const updateItemUnitPrice = (itemId: string, newPrice: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newTotal = item.quantity * newPrice;
        const calculatedDiscount = (item.originalPrice - newPrice) * item.quantity;
        return { 
          ...item, 
          unitPrice: newPrice, 
          discount: Math.max(0, calculatedDiscount),
          total: newTotal 
        };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  // Subtotal = soma dos preços cadastrados (originalPrice) para itens normais
  // Para itens sem preço cadastrado (como frete), usa o preço praticado
  const subtotal = items.reduce((acc, item) => {
    if (item.originalPrice > 0) {
      return acc + (item.quantity * item.originalPrice);
    }
    return acc; // Frete não entra no subtotal
  }, 0);
  
  const totalDiscount = items.reduce((acc, item) => acc + item.discount, 0);
  
  // Total = soma de todos os item.total (inclui frete e descontos)
  const total = items.reduce((acc, item) => acc + item.total, 0);
  
  // Acréscimos (como frete) - itens onde originalPrice = 0
  const totalAdditions = items.reduce((acc, item) => {
    if (item.originalPrice === 0 && item.unitPrice > 0) {
      return acc + item.total;
    }
    return acc;
  }, 0);
  
  const totalWeight = items.reduce((acc, item) => acc + (item.weight || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const uploadReceipt = async (saleId: string): Promise<string | null> => {
    if (!receiptFile) return null;

    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${saleId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, receiptFile);

    if (uploadError) {
      console.error('Error uploading receipt:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Analyze receipt with AI
  const analyzeReceiptWithAI = async (base64Image: string): Promise<{
    success: boolean;
    banco?: string;
    valor?: number;
    confianca?: number;
    tipo_transacao?: string;
  } | null> => {
    try {
      const response = await supabase.functions.invoke('analyze-receipt', {
        body: { imageBase64: base64Image }
      });

      if (response.error) {
        console.error('Error calling analyze-receipt:', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      return null;
    }
  };

  // Verifica se deve mostrar campo de comprovante
  const shouldShowReceiptUpload = paymentCondition === 'PIX' || paymentCondition === 'Deposito';

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Erro",
        description: "Selecione um cliente.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentCondition) {
      toast({
        title: "Erro",
        description: "Selecione uma condição de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isDinheiro = paymentCondition === 'Dinheiro';

      const newSale = await addSale({
        type: saleType,
        number: saleNumber,
        customerId: selectedCustomer.id,
        customerCode: selectedCustomer.code,
        customerName: selectedCustomer.name,
        customerCpfCnpj: selectedCustomer.cpfCnpj,
        customerPhone: selectedCustomer.phone || selectedCustomer.cellphone || undefined,
        customerAddress: [selectedCustomer.street, selectedCustomer.number, selectedCustomer.complement].filter(Boolean).join(', ') || undefined,
        customerNeighborhood: selectedCustomer.neighborhood || undefined,
        customerCity: selectedCustomer.city || undefined,
        customerState: selectedCustomer.state || undefined,
        customerZipCode: selectedCustomer.zipCode || undefined,
        paymentMethodId: '',
        paymentMethodName: paymentCondition,
        paymentType: paymentType,
        items,
        subtotal,
        discount: totalDiscount,
        total,
        totalWeight,
        notes: notes || undefined,
        status: isDinheiro ? 'finalizado' : 'pendente',
        sellerName: user?.name || undefined,
      } as any);

      // Upload receipt and create accounts receivable for ALL sales (pedidos)
      if (saleType === 'pedido') {
        let receiptUrl: string | null = null;
        let aiAnalysisResult: { banco?: string; valor?: number; confianca?: number } | null = null;
        
        if (receiptFile && shouldShowReceiptUpload) {
          receiptUrl = await uploadReceipt(newSale.id);
          
          // Analyze receipt with AI
          if (receiptPreview) {
            toast({
              title: "🤖 Analisando comprovante...",
              description: "A IA está verificando o comprovante de pagamento.",
            });
            aiAnalysisResult = await analyzeReceiptWithAI(receiptPreview);
          }
        }

        // Determine if AI can auto-confirm
        let autoConfirmed = false;
        let confirmedBy: 'manual' | 'ia' | undefined = undefined;
        
        if (aiAnalysisResult && aiAnalysisResult.confianca && aiAnalysisResult.confianca >= 0.8 && aiAnalysisResult.valor) {
          // Check if value matches (tolerance of R$ 0.50)
          const valorConfere = Math.abs(aiAnalysisResult.valor - total) < 0.50;
          
          if (valorConfere) {
            autoConfirmed = true;
            confirmedBy = 'ia';
            toast({
              title: "✅ Baixa Automática por I.A.",
              description: `Comprovante validado! Banco: ${aiAnalysisResult.banco || 'N/A'} | Valor: R$ ${aiAnalysisResult.valor.toFixed(2)}`,
            });
          } else {
            toast({
              title: "⚠️ Valor Divergente",
              description: `Comprovante: R$ ${aiAnalysisResult.valor.toFixed(2)} | Venda: R$ ${total.toFixed(2)}. Requer verificação manual.`,
              variant: "destructive",
            });
          }
        }

        // Create accounts receivable entry
        // Dinheiro: status 'recebido' | AI auto-confirmed: 'recebido' | Outros: status 'pendente'
        const finalStatus = isDinheiro || autoConfirmed ? 'recebido' : 'pendente';
        
        const { error: arError } = await supabase
          .from('accounts_receivable')
          .insert({
            sale_id: newSale.id,
            original_amount: total,
            final_amount: total,
            status: finalStatus,
            receipt_url: receiptUrl,
            receipt_date: finalStatus === 'recebido' ? new Date().toISOString().split('T')[0] : null,
            confirmed_by: autoConfirmed ? 'ia' : (isDinheiro ? 'manual' : null),
            notes: autoConfirmed && aiAnalysisResult ? 
              `Baixa automática por IA. Banco: ${aiAnalysisResult.banco || 'N/A'}. Valor identificado: R$ ${aiAnalysisResult.valor?.toFixed(2) || 'N/A'}` : 
              null,
          });

        if (arError) {
          console.error('Error creating accounts receivable:', arError);
        }

        // Update sale status if auto-confirmed
        if (autoConfirmed) {
          await supabase.from('sales').update({ status: 'finalizado' }).eq('id', newSale.id);
        }
      }

      toast({
        title: saleType === 'pedido' ? "Pedido criado" : "Orçamento criado",
        description: `${saleType === 'pedido' ? 'Pedido' : 'Orçamento'} ${saleNumber} criado com sucesso.`,
      });

      // Open print modal
      setSavedSale(newSale);
      setPrintModalOpen(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePrint = () => {
    setPrintModalOpen(false);
    navigate(saleType === 'pedido' ? '/vendas/pedidos' : '/vendas/orcamentos');
  };

  const currentConditions = paymentType === 'vista' ? conditionsAVista : conditionsAPrazo;

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-16 px-6 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Nova Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type and Number */}
            <div className="flex items-center gap-8 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <RadioGroup
                  value={saleType}
                  onValueChange={(value) => setSaleType(value as 'pedido' | 'orcamento')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pedido" id="pedido" />
                    <Label htmlFor="pedido" className="cursor-pointer">Pedido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="orcamento" id="orcamento" />
                    <Label htmlFor="orcamento" className="cursor-pointer">Orçamento</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <div className="h-10 px-4 py-2 bg-background border rounded-md font-mono font-medium">
                  {saleNumber}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">CLIENTE</h3>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerCode">Código</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customerCode"
                        value={customerCode}
                        onChange={(e) => setCustomerCode(e.target.value)}
                        placeholder="000"
                        className="w-24"
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomerCodeSearch()}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={handleCustomerCodeSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Pesquisar por Nome</Label>
                  <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Digite o nome do cliente..."
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            if (e.target.value.length >= 1) {
                              setCustomerPopoverOpen(true);
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {filteredCustomers.slice(0, 10).map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.id}
                                onSelect={() => handleSelectCustomer(customer)}
                                className="cursor-pointer"
                              >
                                <span className="font-mono mr-2">{customer.code}</span>
                                <span>{customer.name}</span>
                                <span className="ml-auto text-muted-foreground text-sm">{customer.cpfCnpj}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {selectedCustomer && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">{selectedCustomer.name}</p>
                      <p className="text-sm text-green-600">
                        {selectedCustomer.type === 'fisica' ? 'CPF' : 'CNPJ'}: {selectedCustomer.cpfCnpj}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerCode('');
                      }}
                    >
                      Trocar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">PRODUTOS</h3>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Código</Label>
                    <div className="flex gap-2">
                      <Input
                        id="productCode"
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                        placeholder="000"
                        className="w-24"
                        onKeyDown={(e) => e.key === 'Enter' && handleProductCodeSearch()}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={handleProductCodeSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Pesquisar por Nome</Label>
                  <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Digite o nome do produto..."
                          value={productSearch}
                          onChange={(e) => handleProductSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar produto..." 
                          value={productSearch}
                          onValueChange={handleProductSearch}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts.slice(0, 10).map((product) => (
                              <CommandItem
                                key={product.id}
                                onSelect={() => handleSelectProduct(product)}
                                className="cursor-pointer"
                              >
                                <span className="font-mono mr-2">{product.code}</span>
                                <span>{product.name}</span>
                                <span className="ml-auto text-muted-foreground text-sm">{formatCurrency(product.salePrice)}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Items Table com Preço Cadastrado e Preço Praticado */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-16">Un.</TableHead>
                      <TableHead className="w-24 text-right">Qtd</TableHead>
                      <TableHead className="w-28 text-right">Preço Cad.</TableHead>
                      <TableHead className="w-28 text-right">Preço Prat.</TableHead>
                      <TableHead className="w-24 text-right">Desc. R$</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum produto adicionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseFloat(e.target.value) || 1)}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.originalPrice)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItemUnitPrice(item.id, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(item.discount)}
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Desconto:</span>
                      <span>- {formatCurrency(totalDiscount)}</span>
                    </div>
                  )}
                  {totalAdditions > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Frete/Acréscimos:</span>
                      <span>+ {formatCurrency(totalAdditions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground pt-1">
                    <span>Peso Total:</span>
                    <span>{totalWeight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment - Nova estrutura */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">PAGAMENTO</h3>
              
              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label>Forma de Pagamento *</Label>
                <RadioGroup 
                  value={paymentType} 
                  onValueChange={(value) => setPaymentType(value as 'vista' | 'prazo')} 
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vista" id="vista" />
                    <Label htmlFor="vista" className="cursor-pointer">À Vista</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prazo" id="prazo" />
                    <Label htmlFor="prazo" className="cursor-pointer">À Prazo</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Condição de Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condição de Pagamento *</Label>
                  <Select value={paymentCondition} onValueChange={setPaymentCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentConditions.map(cond => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Receipt Upload - Apenas para PIX ou Deposito */}
                {shouldShowReceiptUpload && (
                  <div className="space-y-2">
                    <Label>Comprovante de Pagamento</Label>
                    {receiptPreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={receiptPreview} 
                          alt="Comprovante" 
                          className="h-24 w-auto rounded border object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeReceipt}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id="receipt"
                          accept="image/*"
                          onChange={handleReceiptChange}
                          className="hidden"
                        />
                        <label htmlFor="receipt">
                          <Button variant="outline" asChild className="cursor-pointer">
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Anexar Comprovante
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (saleType === 'pedido' ? 'Salvar Pedido' : 'Salvar Orçamento')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Print Modal */}
      <SalePrintView 
        sale={savedSale} 
        open={printModalOpen} 
        onClose={handleClosePrint} 
      />
    </div>
  );
};

export default NewSale;
