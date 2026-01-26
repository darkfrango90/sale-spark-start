import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Loader2, Check, X, UserPlus, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCustomers } from '@/contexts/CustomerContext';
import { useProducts } from '@/contexts/ProductContext';
import { useSales } from '@/contexts/SalesContext';
import TopMenu from '@/components/dashboard/TopMenu';

type ImportType = 'customers' | 'products' | 'sales';
type FileType = 'excel' | 'pdf';
type ItemStatus = 'ready' | 'needs_correction' | 'error';

interface ImportIssue {
  field: string;
  problem: string;
  currentValue: any;
  suggestedValue: any;
  severity: 'warning' | 'error';
  canAutoFix: boolean;
}

interface AppliedFix {
  row: number;
  field: string;
  originalValue: any;
  newValue: any;
  problem: string;
}

interface ImportItem {
  row: number;
  originalData: Record<string, any>;
  mappedData: Record<string, any>;
  status: ItemStatus;
  issues: ImportIssue[];
  needs_customer_creation?: boolean;
  matched_product_name?: string;
}

interface ColumnMapping {
  excelColumn: string;
  dbField: string;
  confidence: number;
}

interface AnalysisResult {
  columnMapping: ColumnMapping[];
  items: ImportItem[];
  summary: {
    total: number;
    ready: number;
    needsCorrection: number;
    hasError: number;
  };
}

// Types for PDF sales import
interface PDFSaleItem {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  product_id?: string;
  matched_product_code?: string;
  matched_product_name?: string;
  matched_unit?: string;
  status: 'ready' | 'error';
  error?: string;
}

interface PDFSale {
  customer_code?: string;
  customer_name: string;
  customer_cpf_cnpj: string;
  sale_code?: string;
  sale_date?: string;
  seller_name: string;
  payment_method: string;
  items: PDFSaleItem[];
  total: number;
  existing_customer?: { id: string; code: string; name: string } | null;
  needs_customer_creation: boolean;
  status: 'ready' | 'error';
  errors: string[];
}

interface PDFAnalysisResult {
  sales: PDFSale[];
  summary: {
    total: number;
    ready: number;
    hasError: number;
    customersToCreate: number;
    totalItems: number;
  };
}

const DataImport = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, getNextCustomerCode, refreshCustomers } = useCustomers();
  const { products, addProduct } = useProducts();
  const { sales, addSale, getNextSaleNumber, refreshSales } = useSales();
  
  const [importType, setImportType] = useState<ImportType>('customers');
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [pdfAnalysis, setPdfAnalysis] = useState<PDFAnalysisResult | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<AppliedFix[]>([]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const isPDF = uploadedFile.type === 'application/pdf' || uploadedFile.name.toLowerCase().endsWith('.pdf');
    const isExcel = uploadedFile.type.includes('spreadsheet') || 
                    uploadedFile.type.includes('excel') || 
                    uploadedFile.name.match(/\.(xlsx|xls)$/i);
    
    if (!isPDF && !isExcel) {
      toast.error('Formato inválido', { description: 'Por favor, envie um arquivo Excel (.xlsx, .xls) ou PDF' });
      return;
    }

    // PDF only allowed for sales import
    if (isPDF && importType !== 'sales') {
      toast.error('PDF não suportado', { description: 'Importação via PDF só está disponível para Vendas. Use Excel para Clientes e Produtos.' });
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);
    setPdfAnalysis(null);
    setAppliedFixes([]);
    setFileType(isPDF ? 'pdf' : 'excel');

    if (isPDF) {
      toast.success('PDF carregado', { description: 'Clique em "Analisar com IA" para extrair as vendas.' });
      return;
    }

    // Process Excel
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
          toast.error('Planilha vazia', { description: 'A planilha não contém dados para importar.' });
          setFile(null);
          return;
        }

        setRawData(jsonData as Record<string, any>[]);
        toast.success('Arquivo carregado', { description: `${jsonData.length} registros encontrados` });
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Erro ao ler arquivo', { description: 'Não foi possível processar a planilha.' });
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  }, [importType]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      input.files = dataTransfer.files;
      
      const event = { target: input } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Analyze PDF for sales
  const analyzePDF = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // Convert PDF to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const existingCustomers = customers.map(c => ({ 
        id: c.id, 
        code: c.code, 
        cpf_cnpj: c.cpfCnpj, 
        name: c.name 
      }));
      
      const existingProducts = products.map(p => ({ 
        id: p.id, 
        code: p.code, 
        name: p.name, 
        unit: p.unit, 
        salePrice: p.salePrice 
      }));

      toast.info('Processando PDF...', { 
        description: 'Isso pode levar alguns segundos dependendo do tamanho do arquivo.',
        duration: 10000
      });

      const { data, error } = await supabase.functions.invoke('analyze-sales-pdf', {
        body: {
          pdfBase64: base64,
          existingProducts,
          existingCustomers
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Erro na análise do PDF');
      }

      setPdfAnalysis(data);
      toast.success('PDF analisado!', { 
        description: `${data.summary.ready} vendas prontas, ${data.summary.hasError} com erros, ${data.summary.customersToCreate} clientes a criar` 
      });
    } catch (error: any) {
      console.error('PDF analysis error:', error);
      toast.error('Erro na análise', { description: error.message || 'Não foi possível analisar o PDF.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeExcelData = async () => {
    if (rawData.length === 0) {
      toast.error('Nenhum dado', { description: 'Carregue uma planilha primeiro.' });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const existingCustomers = customers.map(c => ({ 
        id: c.id, 
        code: c.code, 
        cpf_cnpj: c.cpfCnpj, 
        name: c.name 
      }));
      
      const existingProducts = products.map(p => ({ 
        id: p.id, 
        code: p.code, 
        name: p.name, 
        unit: p.unit, 
        salePrice: p.salePrice 
      }));

      const { data, error } = await supabase.functions.invoke('analyze-import', {
        body: {
          type: importType,
          data: rawData,
          existingCustomers: importType === 'customers' || importType === 'sales' ? existingCustomers : undefined,
          existingProducts: importType === 'products' || importType === 'sales' ? existingProducts : undefined
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Erro na análise');
      }

      setAnalysis(data);
      toast.success('Análise concluída', { 
        description: `${data.summary.ready} prontos, ${data.summary.needsCorrection} com correções, ${data.summary.hasError} com erros` 
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Erro na análise', { description: error.message || 'Não foi possível analisar os dados.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeData = async () => {
    if (fileType === 'pdf') {
      await analyzePDF();
    } else {
      await analyzeExcelData();
    }
  };

  const applyAutoFixes = () => {
    if (!analysis) return;

    const fixes: AppliedFix[] = [];

    const updatedItems = analysis.items.map(item => {
      if (item.status === 'needs_correction') {
        const autoFixableIssues = item.issues.filter(i => i.canAutoFix && i.suggestedValue !== null);
        
        if (autoFixableIssues.length > 0) {
          const newMappedData = { ...item.mappedData };
          const remainingIssues = item.issues.filter(i => !i.canAutoFix || i.suggestedValue === null);
          
          // Registrar cada correção aplicada
          autoFixableIssues.forEach(issue => {
            fixes.push({
              row: item.row,
              field: issue.field,
              originalValue: issue.currentValue,
              newValue: issue.suggestedValue,
              problem: issue.problem
            });
            newMappedData[issue.field] = issue.suggestedValue;
          });

          return {
            ...item,
            mappedData: newMappedData,
            issues: remainingIssues,
            status: remainingIssues.length === 0 ? 'ready' as ItemStatus : 
                   remainingIssues.some(i => i.severity === 'error') ? 'error' as ItemStatus : 
                   'needs_correction' as ItemStatus
          };
        }
      }
      return item;
    });

    const newSummary = {
      total: updatedItems.length,
      ready: updatedItems.filter(i => i.status === 'ready').length,
      needsCorrection: updatedItems.filter(i => i.status === 'needs_correction').length,
      hasError: updatedItems.filter(i => i.status === 'error').length
    };

    setAppliedFixes(fixes);
    setAnalysis({
      ...analysis,
      items: updatedItems,
      summary: newSummary
    });

    toast.success('Correções aplicadas', { 
      description: `${fixes.length} campo(s) corrigido(s) automaticamente. Veja os detalhes abaixo.` 
    });
  };

  // Helper to generate unique code
  const getUniqueCode = (existingCodes: Set<string>, startNum: number): { code: string; nextNum: number } => {
    let num = startNum;
    let code = String(num).padStart(3, '0');
    while (existingCodes.has(code)) {
      num++;
      code = String(num).padStart(3, '0');
    }
    return { code, nextNum: num + 1 };
  };

  // Import PDF sales
  const importPDFSales = async () => {
    if (!pdfAnalysis) return;

    const readySales = pdfAnalysis.sales.filter(s => s.status === 'ready');
    
    if (readySales.length === 0) {
      toast.error('Nenhuma venda pronta', { description: 'Todas as vendas têm erros de produtos não encontrados.' });
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    let customersCreated = 0;

    try {
      let currentSaleNumber = parseInt(getNextSaleNumber());
      
      // Track created customers during import
      const createdCustomersCpfCnpj = new Map<string, { id: string; code: string; name: string }>();
      
      await refreshCustomers();

      for (const sale of readySales) {
        try {
          const cpfCnpjClean = sale.customer_cpf_cnpj;
          
          // 1. Find or create customer
          let customer = sale.existing_customer 
            ? customers.find(c => c.id === sale.existing_customer?.id) 
            : customers.find(c => c.cpfCnpj?.replace(/\D/g, '') === cpfCnpjClean);
          
          // Check if we already created this customer in this batch
          if (!customer && cpfCnpjClean && createdCustomersCpfCnpj.has(cpfCnpjClean)) {
            const created = createdCustomersCpfCnpj.get(cpfCnpjClean)!;
            customer = {
              id: created.id,
              code: created.code,
              name: created.name,
              cpfCnpj: cpfCnpjClean,
              type: cpfCnpjClean.length === 11 ? 'fisica' : 'juridica',
              phone: '',
              active: true,
              createdAt: new Date()
            } as any;
          }
          
          // Create customer if not found
          if (!customer && sale.needs_customer_creation) {
            const newCode = getNextCustomerCode();
            const customerType = cpfCnpjClean.length === 11 ? 'fisica' : 'juridica';
            
            await addCustomer({
              code: newCode,
              name: sale.customer_name || 'Cliente Importado',
              type: customerType as 'fisica' | 'juridica',
              cpfCnpj: cpfCnpjClean,
              phone: '',
              active: true
            });
            
            customersCreated++;
            
            createdCustomersCpfCnpj.set(cpfCnpjClean, {
              id: crypto.randomUUID(),
              code: newCode,
              name: sale.customer_name || 'Cliente Importado'
            });
            
            await refreshCustomers();
            customer = customers.find(c => c.cpfCnpj?.replace(/\D/g, '') === cpfCnpjClean);
          }
          
          if (!customer) {
            console.error(`Customer not found for sale: ${sale.customer_name}`);
            errorCount++;
            continue;
          }
          
          // 2. Build sale items from matched products
          const saleItems = sale.items
            .filter(item => item.status === 'ready' && item.product_id)
            .map(item => {
              const product = products.find(p => p.id === item.product_id);
              if (!product) return null;
              
              return {
                id: crypto.randomUUID(),
                productId: product.id,
                productCode: product.code,
                productName: item.matched_product_name || product.name,
                unit: item.matched_unit || product.unit,
                quantity: item.quantity,
                originalPrice: product.salePrice,
                unitPrice: item.unit_price,
                discount: 0,
                total: item.total,
                density: product.density,
                weight: product.density ? item.quantity * product.density : undefined
              };
            })
            .filter(Boolean) as any[];

          if (saleItems.length === 0) {
            console.error(`No valid items for sale: ${sale.customer_name}`);
            errorCount++;
            continue;
          }
          
          // 3. Create sale with sequential number
          const saleNumber = String(currentSaleNumber++).padStart(5, '0');
          const subtotal = saleItems.reduce((acc, item) => acc + item.total, 0);
          const totalWeight = saleItems.reduce((acc, item) => acc + (item.weight || 0), 0);
          
          await addSale({
            type: 'pedido',
            number: saleNumber,
            customerId: customer.id,
            customerCode: customer.code,
            customerName: customer.name,
            customerCpfCnpj: customer.cpfCnpj || '',
            customerPhone: customer.phone,
            paymentMethodId: '',
            paymentMethodName: sale.payment_method || 'Importado',
            items: saleItems,
            subtotal,
            discount: 0,
            total: subtotal,
            totalWeight,
            status: 'finalizado',
            sellerName: sale.seller_name || 'Importação'
          });
          
          successCount++;
        } catch (err: any) {
          console.error(`Error importing sale:`, err);
          errorCount++;
        }
      }
      
      await refreshSales();

      if (successCount > 0) {
        const parts = [`${successCount} vendas importadas`];
        if (customersCreated > 0) parts.push(`${customersCreated} clientes criados`);
        if (errorCount > 0) parts.push(`${errorCount} erros`);
        
        toast.success('Importação concluída!', { 
          description: parts.join(', ')
        });
        
        setFile(null);
        setRawData([]);
        setAnalysis(null);
        setPdfAnalysis(null);
        setFileType(null);
      } else {
        toast.error('Falha na importação', { description: 'Nenhuma venda foi importada.' });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Erro na importação', { description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const importExcelData = async () => {
    if (!analysis) return;

    const readyItems = analysis.items.filter(i => i.status === 'ready');
    
    if (readyItems.length === 0) {
      toast.error('Nenhum registro pronto', { description: 'Corrija os erros antes de importar.' });
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let customersCreated = 0;

    try {
      if (importType === 'customers') {
        const existingCodes = new Set(customers.map(c => c.code));
        const existingCpfCnpj = new Set(customers.map(c => c.cpfCnpj?.replace(/\D/g, '')));
        let nextCodeNum = Math.max(1, ...customers.map(c => parseInt(c.code, 10) || 0)) + 1;

        for (const item of readyItems) {
          try {
            const cleanCpfCnpj = item.mappedData.cpf_cnpj?.toString().replace(/\D/g, '');
            if (cleanCpfCnpj && existingCpfCnpj.has(cleanCpfCnpj)) {
              skippedCount++;
              continue;
            }

            let code = item.mappedData.code?.toString().trim() || '';
            if (!code || existingCodes.has(code)) {
              const result = getUniqueCode(existingCodes, nextCodeNum);
              code = result.code;
              nextCodeNum = result.nextNum;
            }
            
            existingCodes.add(code);
            if (cleanCpfCnpj) {
              existingCpfCnpj.add(cleanCpfCnpj);
            }

            await addCustomer({
              code,
              name: item.mappedData.name,
              tradeName: item.mappedData.trade_name,
              type: item.mappedData.type || 'fisica',
              cpfCnpj: item.mappedData.cpf_cnpj,
              rgIe: item.mappedData.rg_ie,
              email: item.mappedData.email,
              phone: item.mappedData.phone || '',
              cellphone: item.mappedData.cellphone,
              zipCode: item.mappedData.zip_code,
              street: item.mappedData.street,
              number: item.mappedData.number,
              complement: item.mappedData.complement,
              neighborhood: item.mappedData.neighborhood,
              city: item.mappedData.city,
              state: item.mappedData.state,
              birthDate: item.mappedData.birth_date,
              notes: item.mappedData.notes,
              active: true,
              hasBarter: item.mappedData.has_barter || false,
              barterCredit: item.mappedData.barter_credit || 0,
              barterLimit: item.mappedData.barter_limit || 0,
              barterNotes: item.mappedData.barter_notes
            });
            successCount++;
          } catch (err: any) {
            console.error(`Error importing row ${item.row}:`, err);
            errorCount++;
          }
        }
      } else if (importType === 'products') {
        const existingCodes = new Set(products.map(p => p.code));
        let nextCodeNum = Math.max(1, ...products.map(p => parseInt(p.code, 10) || 0)) + 1;

        for (const item of readyItems) {
          try {
            let code = item.mappedData.code?.toString().trim() || '';
            if (!code || existingCodes.has(code)) {
              const result = getUniqueCode(existingCodes, nextCodeNum);
              code = result.code;
              nextCodeNum = result.nextNum;
            }
            
            existingCodes.add(code);

            await addProduct({
              code,
              barcode: item.mappedData.barcode,
              name: item.mappedData.name,
              description: item.mappedData.description,
              category: item.mappedData.category,
              unit: item.mappedData.unit || 'UN',
              density: item.mappedData.density,
              costPrice: item.mappedData.cost_price || 0,
              salePrice: item.mappedData.sale_price || 0,
              stock: item.mappedData.stock || 0,
              minStock: item.mappedData.min_stock || 0,
              active: true
            });
            successCount++;
          } catch (err) {
            console.error(`Error importing row ${item.row}:`, err);
            errorCount++;
          }
        }
      } else if (importType === 'sales') {
        let currentSaleNumber = parseInt(getNextSaleNumber());
        const createdCustomersCpfCnpj = new Map<string, { id: string; code: string; name: string }>();
        
        await refreshCustomers();
        
        for (const item of readyItems) {
          try {
            const cpfCnpjClean = item.mappedData.customer_cpf_cnpj?.toString().replace(/\D/g, '') || '';
            
            let customer = customers.find(c => 
              c.cpfCnpj?.replace(/\D/g, '') === cpfCnpjClean ||
              c.name.toLowerCase().trim() === item.mappedData.customer_name?.toLowerCase().trim()
            );
            
            if (!customer && cpfCnpjClean && createdCustomersCpfCnpj.has(cpfCnpjClean)) {
              const created = createdCustomersCpfCnpj.get(cpfCnpjClean)!;
              customer = {
                id: created.id,
                code: created.code,
                name: created.name,
                cpfCnpj: cpfCnpjClean,
                type: cpfCnpjClean.length === 11 ? 'fisica' : 'juridica',
                phone: '',
                active: true,
                createdAt: new Date()
              } as any;
            }
            
            if (!customer && item.needs_customer_creation) {
              const newCode = getNextCustomerCode();
              const customerType = cpfCnpjClean.length === 11 ? 'fisica' : 'juridica';
              
              await addCustomer({
                code: newCode,
                name: item.mappedData.customer_name || 'Cliente Importado',
                type: customerType as 'fisica' | 'juridica',
                cpfCnpj: cpfCnpjClean,
                phone: '',
                active: true
              });
              
              customersCreated++;
              
              createdCustomersCpfCnpj.set(cpfCnpjClean, {
                id: crypto.randomUUID(),
                code: newCode,
                name: item.mappedData.customer_name || 'Cliente Importado'
              });
              
              await refreshCustomers();
              customer = customers.find(c => c.cpfCnpj?.replace(/\D/g, '') === cpfCnpjClean);
            }
            
            if (!customer) {
              errorCount++;
              continue;
            }
            
            const productNameLower = (item.matched_product_name || item.mappedData.product_name)?.toLowerCase().trim();
            const product = products.find(p => 
              p.name.toLowerCase().includes(productNameLower) ||
              productNameLower.includes(p.name.toLowerCase())
            );
            
            if (!product) {
              errorCount++;
              continue;
            }
            
            const saleNumber = String(currentSaleNumber++).padStart(5, '0');
            const quantity = Number(item.mappedData.quantity) || 1;
            const unitPrice = Number(item.mappedData.unit_price) || product.salePrice;
            const total = quantity * unitPrice;
            
            await addSale({
              type: 'pedido',
              number: saleNumber,
              customerId: customer.id,
              customerCode: customer.code,
              customerName: customer.name,
              customerCpfCnpj: customer.cpfCnpj || '',
              customerPhone: customer.phone,
              paymentMethodId: '',
              paymentMethodName: item.mappedData.payment_method || 'Importado',
              items: [{
                id: crypto.randomUUID(),
                productId: product.id,
                productCode: product.code,
                productName: product.name,
                unit: product.unit,
                quantity,
                originalPrice: product.salePrice,
                unitPrice,
                discount: 0,
                total,
                density: product.density,
                weight: product.density ? quantity * product.density : undefined
              }],
              subtotal: total,
              discount: 0,
              total,
              totalWeight: product.density ? quantity * product.density : 0,
              status: 'finalizado',
              sellerName: item.mappedData.seller_name || 'Importação'
            });
            
            successCount++;
          } catch (err: any) {
            console.error(`Error importing sale row ${item.row}:`, err);
            errorCount++;
          }
        }
        
        await refreshSales();
      }

      if (successCount > 0) {
        const parts = [`${successCount} importados`];
        if (customersCreated > 0) parts.push(`${customersCreated} clientes criados`);
        if (skippedCount > 0) parts.push(`${skippedCount} duplicados ignorados`);
        if (errorCount > 0) parts.push(`${errorCount} erros`);
        
        toast.success('Importação concluída', { 
          description: parts.join(', ')
        });
        
        setFile(null);
        setRawData([]);
        setAnalysis(null);
      } else if (skippedCount > 0) {
        toast.info('Todos os registros já existem', { 
          description: `${skippedCount} registros ignorados por duplicidade de CPF/CNPJ` 
        });
      } else {
        toast.error('Falha na importação', { description: 'Nenhum registro foi importado.' });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Erro na importação', { description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const importData = async () => {
    if (fileType === 'pdf') {
      await importPDFSales();
    } else {
      await importExcelData();
    }
  };

  const getStatusIcon = (status: ItemStatus) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'needs_correction':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'ready':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pronto</Badge>;
      case 'needs_correction':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Correção</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>;
    }
  };

  const pendingItems = analysis?.items.filter(i => i.status !== 'ready') || [];
  const readyItems = analysis?.items.filter(i => i.status === 'ready') || [];
  const itemsNeedingCustomerCreation = readyItems.filter(i => i.needs_customer_creation).length;

  // PDF sales data
  const pdfReadySales = pdfAnalysis?.sales.filter(s => s.status === 'ready') || [];
  const pdfErrorSales = pdfAnalysis?.sales.filter(s => s.status === 'error') || [];

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <div className="container mx-auto p-6 pt-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Importação de Dados</h1>
            <p className="text-muted-foreground">Importe dados de planilhas Excel ou PDF com análise inteligente</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {fileType === 'pdf' ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                Upload de Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {file ? (
                    <span className="flex items-center justify-center gap-2">
                      {fileType === 'pdf' ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                      {file.name}
                    </span>
                  ) : (
                    'Arraste um arquivo aqui'
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {file 
                    ? (fileType === 'pdf' ? 'PDF pronto para análise' : `${rawData.length} registros carregados`) 
                    : 'ou clique para selecionar'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {importType === 'sales' 
                    ? 'Formatos suportados: .xlsx, .xls, .pdf' 
                    : 'Formatos suportados: .xlsx, .xls'
                  }
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept={importType === 'sales' ? '.xlsx,.xls,.pdf' : '.xlsx,.xls'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Import Type Selection */}
              <div className="pt-4">
                <Label className="text-base font-medium">Tipo de Importação</Label>
                <RadioGroup
                  value={importType}
                  onValueChange={(value) => {
                    setImportType(value as ImportType);
                    setAnalysis(null);
                    setPdfAnalysis(null);
                    // Reset file if PDF and switching to non-sales
                    if (fileType === 'pdf' && value !== 'sales') {
                      setFile(null);
                      setRawData([]);
                      setFileType(null);
                    }
                  }}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customers" id="customers" />
                    <Label htmlFor="customers">Clientes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="products" id="products" />
                    <Label htmlFor="products">Produtos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sales" id="sales" />
                    <Label htmlFor="sales">Vendas</Label>
                  </div>
                </RadioGroup>
                
                {importType === 'sales' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {fileType === 'pdf' 
                      ? '📄 PDF selecionado: a IA vai extrair vendas com seus itens agrupados, usando Cód.Int. para vincular produtos.'
                      : 'Você pode usar Excel ou PDF. Para PDF, a IA extrai automaticamente as vendas com múltiplos itens.'
                    }
                  </p>
                )}
              </div>

              <Button 
                onClick={analyzeData} 
                disabled={(fileType === 'pdf' ? !file : rawData.length === 0) || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {fileType === 'pdf' ? 'Extraindo vendas do PDF...' : 'Analisando com IA...'}
                  </>
                ) : (
                  fileType === 'pdf' ? 'Extrair Vendas do PDF com IA' : 'Analisar com IA'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* PDF Analysis Summary */}
          {pdfAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vendas Extraídas do PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{pdfAnalysis.summary.total}</p>
                      <p className="text-sm text-muted-foreground">Vendas</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{pdfAnalysis.summary.ready}</p>
                      <p className="text-sm text-green-600">Prontas</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-3xl font-bold text-red-600">{pdfAnalysis.summary.hasError}</p>
                      <p className="text-sm text-red-600">Com Erro</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{pdfAnalysis.summary.customersToCreate}</p>
                      <p className="text-sm text-blue-600">Clientes Novos</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{pdfAnalysis.summary.totalItems}</p>
                      <p className="text-sm text-purple-600">Itens Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Error Sales */}
              {pdfErrorSales.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Vendas com Erros ({pdfErrorSales.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Erro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pdfErrorSales.map((sale, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{sale.customer_name}</TableCell>
                              <TableCell>{sale.seller_name}</TableCell>
                              <TableCell>{sale.items.length}</TableCell>
                              <TableCell className="text-red-600 text-sm">
                                {sale.errors.join(', ')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* PDF Ready Sales */}
              {pdfReadySales.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Vendas Prontas para Importar ({pdfReadySales.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Cond. Pag.</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pdfReadySales.slice(0, 50).map((sale, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{sale.customer_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {sale.customer_cpf_cnpj}
                              </TableCell>
                              <TableCell>{sale.seller_name}</TableCell>
                              <TableCell>{sale.payment_method}</TableCell>
                              <TableCell>{sale.items.length}</TableCell>
                              <TableCell>R$ {sale.total.toFixed(2)}</TableCell>
                              <TableCell>
                                {sale.needs_customer_creation ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Cliente Novo
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Pronto
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {pdfReadySales.length > 50 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground">
                                ... e mais {pdfReadySales.length - 50} vendas
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>

                    <div className="flex justify-end gap-4 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFile(null);
                          setRawData([]);
                          setAnalysis(null);
                          setPdfAnalysis(null);
                          setFileType(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button 
                        onClick={importData}
                        disabled={isImporting || pdfReadySales.length === 0}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar {pdfReadySales.length} Vendas
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Excel Analysis Summary */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">{analysis.summary.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{analysis.summary.ready}</p>
                    <p className="text-sm text-green-600">Prontos</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">{analysis.summary.needsCorrection}</p>
                    <p className="text-sm text-yellow-600">Com Correção</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">{analysis.summary.hasError}</p>
                    <p className="text-sm text-red-600">Com Erro</p>
                  </div>
                </div>
                
                {importType === 'sales' && itemsNeedingCustomerCreation > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      {itemsNeedingCustomerCreation} cliente(s) serão criados automaticamente durante a importação
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Applied Fixes Card */}
          {appliedFixes.length > 0 && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Correções Aplicadas pela IA ({appliedFixes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Linha</TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>Problema</TableHead>
                        <TableHead>Valor Original</TableHead>
                        <TableHead>Valor Corrigido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appliedFixes.map((fix, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{fix.row}</TableCell>
                          <TableCell className="font-medium">{fix.field}</TableCell>
                          <TableCell className="text-muted-foreground">{fix.problem}</TableCell>
                          <TableCell className="text-red-600 line-through">
                            {fix.originalValue?.toString() || '-'}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {fix.newValue?.toString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Pending Items (Excel) */}
          {pendingItems.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Pendências a Corrigir ({pendingItems.length})
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={applyAutoFixes}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aplicar Correções Automáticas
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Linha</TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>Problema</TableHead>
                        <TableHead>Valor Atual</TableHead>
                        <TableHead>Sugestão IA</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingItems.flatMap(item => 
                        item.issues.map((issue, idx) => (
                          <TableRow key={`${item.row}-${idx}`}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell className="font-medium">{issue.field}</TableCell>
                            <TableCell>{issue.problem}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {issue.currentValue?.toString() || '-'}
                            </TableCell>
                            <TableCell>
                              {issue.suggestedValue ? (
                                <span className="text-green-600 font-medium">
                                  {issue.suggestedValue.toString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={issue.severity === 'error' 
                                  ? 'bg-red-50 text-red-700' 
                                  : 'bg-yellow-50 text-yellow-700'
                                }
                              >
                                {issue.canAutoFix ? 'Auto-fix' : 'Manual'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Ready Items (Excel) */}
          {readyItems.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Dados Prontos para Importar ({readyItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Linha</TableHead>
                        <TableHead>
                          {importType === 'customers' ? 'Nome' : importType === 'sales' ? 'Cliente' : 'Produto'}
                        </TableHead>
                        <TableHead>
                          {importType === 'customers' ? 'CPF/CNPJ' : importType === 'sales' ? 'Produto' : 'Código'}
                        </TableHead>
                        <TableHead>
                          {importType === 'customers' ? 'Telefone' : importType === 'sales' ? 'Qtd' : 'Preço'}
                        </TableHead>
                        {importType === 'customers' && (
                          <>
                            <TableHead>Cidade</TableHead>
                            <TableHead>UF</TableHead>
                          </>
                        )}
                        {importType === 'sales' && (
                          <TableHead>Valor Un.</TableHead>
                        )}
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readyItems.slice(0, 50).map(item => (
                        <TableRow key={item.row}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell className="font-medium">
                            {importType === 'sales' ? item.mappedData.customer_name : item.mappedData.name}
                          </TableCell>
                          <TableCell>
                            {importType === 'customers' 
                              ? item.mappedData.cpf_cnpj 
                              : importType === 'sales'
                              ? (item.matched_product_name || item.mappedData.product_name)
                              : item.mappedData.code
                            }
                          </TableCell>
                          <TableCell>
                            {importType === 'customers' 
                              ? item.mappedData.phone 
                              : importType === 'sales'
                              ? item.mappedData.quantity
                              : `R$ ${item.mappedData.sale_price?.toFixed(2) || '0,00'}`
                            }
                          </TableCell>
                          {importType === 'customers' && (
                            <>
                              <TableCell>{item.mappedData.city || '-'}</TableCell>
                              <TableCell>{item.mappedData.state || '-'}</TableCell>
                            </>
                          )}
                          {importType === 'sales' && (
                            <TableCell>R$ {item.mappedData.unit_price?.toFixed(2) || '0,00'}</TableCell>
                          )}
                          <TableCell>
                            {item.needs_customer_creation ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Novo
                              </Badge>
                            ) : (
                              getStatusBadge(item.status)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {readyItems.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={importType === 'customers' ? 7 : importType === 'sales' ? 6 : 5} className="text-center text-muted-foreground">
                            ... e mais {readyItems.length - 50} registros
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="flex justify-end gap-4 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFile(null);
                      setRawData([]);
                      setAnalysis(null);
                      setAppliedFixes([]);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={importData}
                    disabled={isImporting || readyItems.length === 0}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importar {readyItems.length} Registros
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImport;
