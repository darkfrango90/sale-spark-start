import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Loader2, Check, X } from 'lucide-react';
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
import TopMenu from '@/components/dashboard/TopMenu';

type ImportType = 'customers' | 'products' | 'sales';
type ItemStatus = 'ready' | 'needs_correction' | 'error';

interface ImportIssue {
  field: string;
  problem: string;
  currentValue: any;
  suggestedValue: any;
  severity: 'warning' | 'error';
  canAutoFix: boolean;
}

interface ImportItem {
  row: number;
  originalData: Record<string, any>;
  mappedData: Record<string, any>;
  status: ItemStatus;
  issues: ImportIssue[];
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

const DataImport = () => {
  const navigate = useNavigate();
  const { customers, addCustomer } = useCustomers();
  const { products, addProduct } = useProducts();
  
  const [importType, setImportType] = useState<ImportType>('customers');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Formato inválido', { description: 'Por favor, envie um arquivo Excel (.xlsx ou .xls)' });
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);

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
  }, []);

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

  const analyzeData = async () => {
    if (rawData.length === 0) {
      toast.error('Nenhum dado', { description: 'Carregue uma planilha primeiro.' });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const existingCustomers = importType === 'customers' 
        ? customers.map(c => ({ code: c.code, cpf_cnpj: c.cpfCnpj, name: c.name }))
        : undefined;
      
      const existingProducts = importType === 'products'
        ? products.map(p => ({ code: p.code, name: p.name }))
        : undefined;

      const { data, error } = await supabase.functions.invoke('analyze-import', {
        body: {
          type: importType,
          data: rawData,
          existingCustomers,
          existingProducts
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

  const applyAutoFixes = () => {
    if (!analysis) return;

    const updatedItems = analysis.items.map(item => {
      if (item.status === 'needs_correction') {
        const autoFixableIssues = item.issues.filter(i => i.canAutoFix && i.suggestedValue !== null);
        
        if (autoFixableIssues.length > 0) {
          const newMappedData = { ...item.mappedData };
          const remainingIssues = item.issues.filter(i => !i.canAutoFix || i.suggestedValue === null);
          
          autoFixableIssues.forEach(issue => {
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

    setAnalysis({
      ...analysis,
      items: updatedItems,
      summary: newSummary
    });

    toast.success('Correções aplicadas', { description: 'As sugestões automáticas foram aplicadas.' });
  };

  const importData = async () => {
    if (!analysis) return;

    const readyItems = analysis.items.filter(i => i.status === 'ready');
    
    if (readyItems.length === 0) {
      toast.error('Nenhum registro pronto', { description: 'Corrija os erros antes de importar.' });
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of readyItems) {
        try {
          if (importType === 'customers') {
            await addCustomer({
              code: item.mappedData.code || '',
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
          } else if (importType === 'products') {
            await addProduct({
              code: item.mappedData.code || '',
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
          }
        } catch (err) {
          console.error(`Error importing row ${item.row}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success('Importação concluída', { 
          description: `${successCount} registros importados${errorCount > 0 ? `, ${errorCount} erros` : ''}` 
        });
        
        // Reset state
        setFile(null);
        setRawData([]);
        setAnalysis(null);
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
            <p className="text-muted-foreground">Importe dados de planilhas Excel com análise inteligente</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
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
                  {file ? file.name : 'Arraste um arquivo Excel aqui'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {file ? `${rawData.length} registros carregados` : 'ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos suportados: .xlsx, .xls
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
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
                    <RadioGroupItem value="sales" id="sales" disabled />
                    <Label htmlFor="sales" className="text-muted-foreground">Vendas (em breve)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={analyzeData} 
                disabled={rawData.length === 0 || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  'Analisar com IA'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
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
              </CardContent>
            </Card>
          )}

          {/* Pending Items */}
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

          {/* Ready Items */}
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
                          {importType === 'customers' ? 'Nome' : 'Produto'}
                        </TableHead>
                        <TableHead>
                          {importType === 'customers' ? 'CPF/CNPJ' : 'Código'}
                        </TableHead>
                        <TableHead>
                          {importType === 'customers' ? 'Telefone' : 'Preço'}
                        </TableHead>
                        {importType === 'customers' && (
                          <>
                            <TableHead>Cidade</TableHead>
                            <TableHead>UF</TableHead>
                          </>
                        )}
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readyItems.slice(0, 50).map(item => (
                        <TableRow key={item.row}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell className="font-medium">
                            {item.mappedData.name}
                          </TableCell>
                          <TableCell>
                            {importType === 'customers' 
                              ? item.mappedData.cpf_cnpj 
                              : item.mappedData.code
                            }
                          </TableCell>
                          <TableCell>
                            {importType === 'customers' 
                              ? item.mappedData.phone 
                              : `R$ ${item.mappedData.sale_price?.toFixed(2) || '0,00'}`
                            }
                          </TableCell>
                          {importType === 'customers' && (
                            <>
                              <TableCell>{item.mappedData.city || '-'}</TableCell>
                              <TableCell>{item.mappedData.state || '-'}</TableCell>
                            </>
                          )}
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {readyItems.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={importType === 'customers' ? 7 : 5} className="text-center text-muted-foreground">
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
