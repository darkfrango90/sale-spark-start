import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopMenu from "@/components/dashboard/TopMenu";
import { useProducts } from "@/contexts/ProductContext";
import { useSales } from "@/contexts/SalesContext";
import { ArrowLeft, Printer, Filter, Package, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ProductsReport = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { sales } = useSales();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter((c): c is string => !!c);
    return [...new Set(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      if (statusFilter === "active" && !product.active) return false;
      if (statusFilter === "inactive" && product.active) return false;
      if (stockFilter === "critical" && product.stock >= (product.minStock || 0)) return false;
      if (stockFilter === "normal" && product.stock < (product.minStock || 0)) return false;
      return true;
    });
  }, [products, categoryFilter, statusFilter, stockFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeProducts = products.filter(p => p.active);
    const criticalStock = products.filter(p => p.stock < (p.minStock || 0));
    const totalStockCost = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
    const totalStockSale = products.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);
    
    return { 
      activeProducts: activeProducts.length, 
      criticalStock: criticalStock.length,
      totalStockCost,
      totalStockSale
    };
  }, [products]);

  // Products sales analysis (ABC)
  const productsSalesAnalysis = useMemo(() => {
    const salesData: Record<string, { name: string; quantity: number; total: number }> = {};
    
    sales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        sale.items.forEach(item => {
          if (!salesData[item.productId]) {
            salesData[item.productId] = { name: item.productName, quantity: 0, total: 0 };
          }
          salesData[item.productId].quantity += item.quantity;
          salesData[item.productId].total += item.total;
        });
      });
    
    const sorted = Object.values(salesData).sort((a, b) => b.total - a.total);
    const grandTotal = sorted.reduce((sum, item) => sum + item.total, 0);
    
    let accumulated = 0;
    return sorted.map(item => {
      accumulated += item.total;
      const percentAccumulated = grandTotal > 0 ? (accumulated / grandTotal) * 100 : 0;
      let classification = 'C';
      if (percentAccumulated <= 80) classification = 'A';
      else if (percentAccumulated <= 95) classification = 'B';
      
      return { ...item, classification };
    });
  }, [sales]);

  // Margin analysis
  const marginAnalysis = useMemo(() => {
    return filteredProducts.map(product => {
      const margin = product.costPrice > 0 
        ? ((product.salePrice - product.costPrice) / product.costPrice) * 100 
        : 0;
      return {
        ...product,
        margin
      };
    }).sort((a, b) => b.margin - a.margin);
  }, [filteredProducts]);

  // Stock by category
  const stockByCategory = useMemo(() => {
    const grouped: Record<string, { name: string; quantity: number; value: number }> = {};
    products.forEach(product => {
      const category = product.category || 'Sem Categoria';
      if (!grouped[category]) {
        grouped[category] = { name: category, quantity: 0, value: 0 };
      }
      grouped[category].quantity += product.stock;
      grouped[category].value += product.stock * product.costPrice;
    });
    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [products]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-28 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Relatório de Produtos/Estoque</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Situação</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estoque</Label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="critical">Abaixo do Mínimo</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                    <p className="text-xl font-bold text-foreground">{metrics.activeProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Crítico</p>
                    <p className="text-xl font-bold text-foreground">{metrics.criticalStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Custo</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(metrics.totalStockCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Venda</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(metrics.totalStockSale)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="stock" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stock">Posição de Estoque</TabsTrigger>
              <TabsTrigger value="critical">Estoque Crítico</TabsTrigger>
              <TabsTrigger value="margin">Margem de Lucro</TabsTrigger>
              <TabsTrigger value="abc">Curva ABC</TabsTrigger>
              <TabsTrigger value="category">Por Categoria</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <CardTitle>Posição de Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Estoque</TableHead>
                        <TableHead className="text-right">Mínimo</TableHead>
                        <TableHead className="text-right">Custo Unit.</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map(product => (
                        <TableRow key={product.id} className={product.stock < (product.minStock || 0) ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{product.code}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category || '-'}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell className="text-right">{product.stock.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{product.minStock?.toFixed(2) || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.costPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.stock * product.costPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                      <span className="text-muted-foreground mr-4">Total em Estoque:</span>
                      <span className="text-xl font-bold">{formatCurrency(metrics.totalStockCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="critical">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos com Estoque Crítico</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Estoque Atual</TableHead>
                        <TableHead className="text-right">Estoque Mínimo</TableHead>
                        <TableHead className="text-right">Falta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products
                        .filter(p => p.stock < (p.minStock || 0))
                        .map(product => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.code}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category || '-'}</TableCell>
                            <TableCell className="text-right text-red-600 font-medium">{product.stock.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{product.minStock?.toFixed(2) || '-'}</TableCell>
                            <TableCell className="text-right text-red-600">{((product.minStock || 0) - product.stock).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="margin">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Margem de Lucro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Custo</TableHead>
                          <TableHead className="text-right">Venda</TableHead>
                          <TableHead className="text-right">Margem %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {marginAnalysis.slice(0, 15).map(product => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(product.costPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(product.salePrice)}</TableCell>
                            <TableCell className={`text-right font-medium ${product.margin < 20 ? 'text-red-600' : product.margin > 50 ? 'text-green-600' : ''}`}>
                              {product.margin.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Margens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={marginAnalysis.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        <Bar dataKey="margin" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="abc">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Curva ABC de Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Classe</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Total Vendido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsSalesAnalysis.slice(0, 15).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                item.classification === 'A' ? 'bg-green-100 text-green-700' :
                                item.classification === 'B' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.classification}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição ABC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Classe A', value: productsSalesAnalysis.filter(p => p.classification === 'A').length },
                            { name: 'Classe B', value: productsSalesAnalysis.filter(p => p.classification === 'B').length },
                            { name: 'Classe C', value: productsSalesAnalysis.filter(p => p.classification === 'C').length },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="category">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estoque por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Valor em Estoque</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockByCategory.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stockByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stockByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductsReport;
