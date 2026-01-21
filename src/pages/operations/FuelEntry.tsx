import { useState, useEffect } from "react";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fuel, Plus, ArrowLeft, Calendar, Gauge, Droplets, DollarSign, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vehicle, FuelEntry as FuelEntryType, FuelType } from "@/types/vehicle";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

const fuelTypeLabels: Record<FuelType, string> = {
  gasolina: "Gasolina",
  diesel: "Diesel"
};

const FuelEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<FuelEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form state - usando total_cost em vez de price_per_liter
  const [formData, setFormData] = useState({
    vehicle_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    odometer_value: "",
    liters: "",
    fuel_type: "diesel" as FuelType,
    total_cost: "", // Valor Total (input do usuário)
    notes: ""
  });

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar veículos");
      console.error(error);
    } else {
      setVehicles(data as Vehicle[]);
    }
  };

  const fetchEntries = async () => {
    let query = supabase
      .from("fuel_entries")
      .select("*, vehicle:vehicles(*)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);

    // Se não for admin, filtrar pelo user_id do usuário logado
    if (!isAdmin && user?.id) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar abastecimentos");
      console.error(error);
    } else {
      setEntries(data as FuelEntryType[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, isAdmin]);

  // Update selected vehicle when vehicle_id changes
  useEffect(() => {
    if (formData.vehicle_id) {
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      setSelectedVehicle(vehicle || null);
      if (vehicle) {
        setFormData(prev => ({
          ...prev,
          fuel_type: vehicle.fuel_type
        }));
      }
    } else {
      setSelectedVehicle(null);
    }
  }, [formData.vehicle_id, vehicles]);

  // Calcular preço por litro automaticamente
  const calculatePricePerLiter = (): number | null => {
    const totalCost = parseFloat(formData.total_cost);
    const liters = parseFloat(formData.liters);
    if (totalCost > 0 && liters > 0) {
      return totalCost / liters;
    }
    return null;
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: "",
      date: format(new Date(), "yyyy-MM-dd"),
      odometer_value: "",
      liters: "",
      fuel_type: "diesel",
      total_cost: "",
      notes: ""
    });
    setSelectedVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id) {
      toast.error("Selecione um veículo");
      return;
    }

    if (!formData.odometer_value) {
      toast.error("Informe o KM/Horímetro");
      return;
    }

    if (!formData.liters) {
      toast.error("Informe a quantidade de litros");
      return;
    }

    setSaving(true);

    const totalCost = parseFloat(formData.total_cost) || null;
    const pricePerLiter = calculatePricePerLiter();

    const entryData = {
      vehicle_id: formData.vehicle_id,
      date: formData.date,
      odometer_value: parseFloat(formData.odometer_value),
      liters: parseFloat(formData.liters),
      fuel_type: formData.fuel_type,
      price_per_liter: pricePerLiter,
      total_cost: totalCost,
      operator_name: user?.name || null,
      user_id: user?.id || null,
      notes: formData.notes.trim() || null
    };

    const { error } = await supabase
      .from("fuel_entries")
      .insert([entryData]);

    if (error) {
      toast.error("Erro ao salvar abastecimento");
      console.error(error);
    } else {
      toast.success("Abastecimento registrado com sucesso!");
      resetForm();
      fetchEntries();
    }

    setSaving(false);
  };

  const pricePerLiter = calculatePricePerLiter();

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Fuel className="h-6 w-6" />
                Abastecimento
              </h1>
              <p className="text-muted-foreground">Registre os abastecimentos dos veículos</p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Novo Abastecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Vehicle Selection */}
                <div className="space-y-2">
                  <Label htmlFor="vehicle" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Veículo *
                  </Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  >
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} {vehicle.plate && `(${vehicle.plate})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vehicles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum veículo cadastrado.{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/operacao/veiculos")}>
                        Cadastrar veículo
                      </Button>
                    </p>
                  )}
                </div>

                {/* Date and Odometer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="odometer" className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      {selectedVehicle?.uses_odometer !== false ? "KM" : "Horímetro"} *
                    </Label>
                    <Input
                      id="odometer"
                      type="number"
                      step="0.1"
                      value={formData.odometer_value}
                      onChange={(e) => setFormData({ ...formData, odometer_value: e.target.value })}
                      placeholder={selectedVehicle?.uses_odometer !== false ? "Ex: 125430" : "Ex: 1250.5"}
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Liters and Fuel Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="liters" className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Litros *
                    </Label>
                    <Input
                      id="liters"
                      type="number"
                      step="0.01"
                      value={formData.liters}
                      onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                      placeholder="Ex: 150.50"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Combustível *</Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(value: FuelType) => setFormData({ ...formData, fuel_type: value })}
                    >
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="gasolina">Gasolina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Total Cost (novo campo) */}
                <div className="space-y-2">
                  <Label htmlFor="totalCost" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Total (R$)
                  </Label>
                  <Input
                    id="totalCost"
                    type="number"
                    step="0.01"
                    value={formData.total_cost}
                    onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                    placeholder="Ex: 850.00"
                    className="h-12 text-lg"
                  />
                  {/* Exibir preço por litro calculado automaticamente */}
                  {pricePerLiter && (
                    <p className="text-sm text-muted-foreground">
                      Preço/Litro: R$ {pricePerLiter.toFixed(3)}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações adicionais..."
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg gap-2"
                  disabled={saving}
                >
                  <Plus className="h-5 w-5" />
                  {saving ? "Salvando..." : "Registrar Abastecimento"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isAdmin ? 'Últimos 20 Abastecimentos' : 'Meus Últimos Abastecimentos'}
              </CardTitle>
              <CardDescription>
                {isAdmin ? '20 registros mais recentes de todos os usuários' : 'Seus registros mais recentes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum abastecimento registrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>KM/Hor.</TableHead>
                        <TableHead>Litros</TableHead>
                        <TableHead>Combustível</TableHead>
                        <TableHead>Custo</TableHead>
                        {isAdmin && <TableHead>Operador</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {format(new Date(entry.date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.vehicle?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {entry.odometer_value.toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            {entry.liters.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} L
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entry.fuel_type === "diesel"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}>
                              {fuelTypeLabels[entry.fuel_type]}
                            </span>
                          </TableCell>
                          <TableCell>
                            {entry.total_cost 
                              ? `R$ ${entry.total_cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                              : "-"}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-muted-foreground">
                              {entry.operator_name || "-"}
                            </TableCell>
                          )}
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

export default FuelEntry;