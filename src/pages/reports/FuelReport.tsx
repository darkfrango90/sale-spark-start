import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fuel, ArrowLeft, Filter, Printer, TrendingUp, Droplets, DollarSign, Gauge } from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Vehicle, FuelEntry, FuelType } from "@/types/vehicle";

const fuelTypeLabels: Record<FuelType, string> = {
  gasolina: "Gasolina",
  diesel: "Diesel"
};

interface FuelEntryWithConsumption extends FuelEntry {
  km_rodados: number;
  consumo_medio: number | null;
}

const FuelReport = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);

    // Fetch all fuel entries
    const { data: entriesData, error: entriesError } = await supabase
      .from("fuel_entries")
      .select("*, vehicle:vehicles(*)")
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (entriesError) {
      toast.error("Erro ao carregar abastecimentos");
      console.error(entriesError);
    } else {
      setEntries(entriesData as FuelEntry[]);
    }

    // Fetch vehicles for filter
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("*")
      .order("name", { ascending: true });

    if (vehiclesError) {
      console.error(vehiclesError);
    } else {
      setVehicles(vehiclesData as Vehicle[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular consumo médio
  const entriesWithConsumption = useMemo((): FuelEntryWithConsumption[] => {
    // Agrupar por veículo
    const byVehicle: Record<string, FuelEntry[]> = {};
    
    entries.forEach(entry => {
      if (!byVehicle[entry.vehicle_id]) {
        byVehicle[entry.vehicle_id] = [];
      }
      byVehicle[entry.vehicle_id].push(entry);
    });

    const results: FuelEntryWithConsumption[] = [];

    Object.entries(byVehicle).forEach(([vehicleId, vehicleEntries]) => {
      // Ordenar por data e created_at crescente
      const sorted = vehicleEntries.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      sorted.forEach((entry, index) => {
        let kmRodados = 0;
        let consumoMedio: number | null = null;

        if (index > 0) {
          const anterior = sorted[index - 1];
          kmRodados = entry.odometer_value - anterior.odometer_value;
          if (kmRodados > 0 && entry.liters > 0) {
            consumoMedio = kmRodados / entry.liters;
          }
        }

        results.push({
          ...entry,
          km_rodados: kmRodados,
          consumo_medio: consumoMedio
        });
      });
    });

    return results;
  }, [entries]);

  // Filtrar por data e veículo
  const filteredEntries = useMemo(() => {
    return entriesWithConsumption.filter(entry => {
      const entryDate = parseISO(entry.date);
      const inDateRange = isWithinInterval(entryDate, {
        start: parseISO(startDate),
        end: parseISO(endDate)
      });

      const matchesVehicle = vehicleFilter === "all" || entry.vehicle_id === vehicleFilter;

      return inDateRange && matchesVehicle;
    }).sort((a, b) => {
      // Ordenar por data decrescente para exibição
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [entriesWithConsumption, startDate, endDate, vehicleFilter]);

  // Métricas
  const metrics = useMemo(() => {
    const totalLitros = filteredEntries.reduce((sum, e) => sum + e.liters, 0);
    const totalCusto = filteredEntries.reduce((sum, e) => sum + (e.total_cost || 0), 0);
    const totalKm = filteredEntries.reduce((sum, e) => sum + e.km_rodados, 0);

    // Calcular consumo médio geral (excluindo primeiro abastecimento de cada veículo)
    const entriesWithConsumption = filteredEntries.filter(e => e.consumo_medio !== null);
    const consumoMedio = entriesWithConsumption.length > 0
      ? totalKm / entriesWithConsumption.reduce((sum, e) => sum + e.liters, 0)
      : null;

    return {
      totalLitros,
      totalCusto,
      totalKm,
      consumoMedio,
      totalAbastecimentos: filteredEntries.length
    };
  }, [filteredEntries]);

  // Resumo por veículo
  const vehicleSummary = useMemo(() => {
    const summary: Record<string, {
      vehicle: Vehicle | undefined;
      totalLitros: number;
      totalCusto: number;
      totalKm: number;
      consumoMedio: number | null;
      count: number;
    }> = {};

    filteredEntries.forEach(entry => {
      if (!summary[entry.vehicle_id]) {
        summary[entry.vehicle_id] = {
          vehicle: entry.vehicle,
          totalLitros: 0,
          totalCusto: 0,
          totalKm: 0,
          consumoMedio: null,
          count: 0
        };
      }

      summary[entry.vehicle_id].totalLitros += entry.liters;
      summary[entry.vehicle_id].totalCusto += entry.total_cost || 0;
      summary[entry.vehicle_id].totalKm += entry.km_rodados;
      summary[entry.vehicle_id].count += 1;
    });

    // Calcular consumo médio por veículo
    Object.values(summary).forEach(v => {
      if (v.totalKm > 0 && v.totalLitros > 0) {
        v.consumoMedio = v.totalKm / v.totalLitros;
      }
    });

    return Object.values(summary).sort((a, b) => 
      (a.vehicle?.name || "").localeCompare(b.vehicle?.name || "")
    );
  }, [filteredEntries]);

  const clearFilters = () => {
    setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(new Date()), "yyyy-MM-dd"));
    setVehicleFilter("all");
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
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/relatorios")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Fuel className="h-6 w-6" />
                  Relatório de Abastecimento
                </h1>
                <p className="text-muted-foreground">Consumo de combustível por veículo</p>
              </div>
            </div>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6 print:hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Veículo</Label>
                  <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os veículos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os veículos</SelectItem>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} {v.plate && `(${v.plate})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Total Litros</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.totalLitros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} L
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Total Gasto</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(metrics.totalCusto)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">KM Rodados</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.totalKm.toLocaleString("pt-BR")} km
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Consumo Médio</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.consumoMedio ? `${metrics.consumoMedio.toFixed(2)} km/L` : "-"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-muted-foreground">Abastecimentos</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.totalAbastecimentos}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary by Vehicle */}
          {vehicleSummary.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumo por Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Placa</TableHead>
                        <TableHead className="text-right">Abastecimentos</TableHead>
                        <TableHead className="text-right">Litros</TableHead>
                        <TableHead className="text-right">Custo Total</TableHead>
                        <TableHead className="text-right">KM Rodados</TableHead>
                        <TableHead className="text-right">Consumo Médio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicleSummary.map((v, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{v.vehicle?.name || "-"}</TableCell>
                          <TableCell>{v.vehicle?.plate || "-"}</TableCell>
                          <TableCell className="text-right">{v.count}</TableCell>
                          <TableCell className="text-right">
                            {v.totalLitros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} L
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(v.totalCusto)}</TableCell>
                          <TableCell className="text-right">
                            {v.totalKm.toLocaleString("pt-BR")} km
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {v.consumoMedio ? `${v.consumoMedio.toFixed(2)} km/L` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhamento de Abastecimentos</CardTitle>
              <CardDescription>
                {filteredEntries.length} registros encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum abastecimento encontrado no período
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Placa</TableHead>
                        <TableHead className="text-right">Litros</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">KM Atual</TableHead>
                        <TableHead className="text-right">KM Rodados</TableHead>
                        <TableHead className="text-right">Consumo (km/L)</TableHead>
                        <TableHead>Operador</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {format(new Date(entry.date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">{entry.vehicle?.name || "-"}</TableCell>
                          <TableCell>{entry.vehicle?.plate || "-"}</TableCell>
                          <TableCell className="text-right">
                            {entry.liters.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} L
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.total_cost ? formatCurrency(entry.total_cost) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.odometer_value.toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.km_rodados > 0 ? `${entry.km_rodados.toLocaleString("pt-BR")} km` : "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {entry.consumo_medio ? (
                              <span className={
                                entry.consumo_medio < 3 
                                  ? "text-red-600" 
                                  : entry.consumo_medio > 6 
                                    ? "text-green-600" 
                                    : ""
                              }>
                                {entry.consumo_medio.toFixed(2)} km/L
                              </span>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.operator_name || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FuelReport;