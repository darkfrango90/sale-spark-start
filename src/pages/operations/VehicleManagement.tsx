import { useState, useEffect } from "react";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Truck, Car, Wrench, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vehicle, VehicleType, FuelType } from "@/types/vehicle";

const vehicleTypeLabels: Record<VehicleType, string> = {
  caminhao: "Caminhão",
  carro: "Carro",
  maquinario: "Maquinário"
};

const vehicleTypeIcons: Record<VehicleType, React.ElementType> = {
  caminhao: Truck,
  carro: Car,
  maquinario: Wrench
};

const fuelTypeLabels: Record<FuelType, string> = {
  gasolina: "Gasolina",
  diesel: "Diesel"
};

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    type: "caminhao" as VehicleType,
    fuel_type: "diesel" as FuelType,
    tank_capacity: "",
    uses_odometer: true,
    active: true
  });

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar veículos");
      console.error(error);
    } else {
      setVehicles(data as Vehicle[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      plate: "",
      type: "caminhao",
      fuel_type: "diesel",
      tank_capacity: "",
      uses_odometer: true,
      active: true
    });
    setEditingVehicle(null);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      plate: vehicle.plate || "",
      type: vehicle.type,
      fuel_type: vehicle.fuel_type,
      tank_capacity: vehicle.tank_capacity?.toString() || "",
      uses_odometer: vehicle.uses_odometer,
      active: vehicle.active
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const vehicleData = {
      name: formData.name.trim(),
      plate: formData.plate.trim() || null,
      type: formData.type,
      fuel_type: formData.fuel_type,
      tank_capacity: formData.tank_capacity ? parseFloat(formData.tank_capacity) : null,
      uses_odometer: formData.uses_odometer,
      active: formData.active
    };

    if (editingVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update(vehicleData)
        .eq("id", editingVehicle.id);

      if (error) {
        toast.error("Erro ao atualizar veículo");
        console.error(error);
      } else {
        toast.success("Veículo atualizado com sucesso");
        setDialogOpen(false);
        resetForm();
        fetchVehicles();
      }
    } else {
      const { error } = await supabase
        .from("vehicles")
        .insert([vehicleData]);

      if (error) {
        toast.error("Erro ao criar veículo");
        console.error(error);
      } else {
        toast.success("Veículo criado com sucesso");
        setDialogOpen(false);
        resetForm();
        fetchVehicles();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Veículos</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? "Editar Veículo" : "Novo Veículo"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome/Descrição *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Caminhão Caçamba 01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: VehicleType) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caminhao">Caminhão</SelectItem>
                          <SelectItem value="carro">Carro</SelectItem>
                          <SelectItem value="maquinario">Maquinário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plate">Placa</Label>
                      <Input
                        id="plate"
                        value={formData.plate}
                        onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                        placeholder="ABC-1234"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fuel_type">Combustível *</Label>
                      <Select
                        value={formData.fuel_type}
                        onValueChange={(value: FuelType) => setFormData({ ...formData, fuel_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="gasolina">Gasolina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tank_capacity">Capacidade (L)</Label>
                      <Input
                        id="tank_capacity"
                        type="number"
                        step="0.1"
                        value={formData.tank_capacity}
                        onChange={(e) => setFormData({ ...formData, tank_capacity: e.target.value })}
                        placeholder="300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="uses_odometer"
                        checked={formData.uses_odometer}
                        onCheckedChange={(checked) => setFormData({ ...formData, uses_odometer: checked })}
                      />
                      <Label htmlFor="uses_odometer">
                        {formData.uses_odometer ? "Usa KM (Odômetro)" : "Usa Horímetro"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <Label htmlFor="active">Ativo</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingVehicle ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Vehicle List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum veículo cadastrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Combustível</TableHead>
                      <TableHead>Medição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => {
                      const Icon = vehicleTypeIcons[vehicle.type];
                      return (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{vehicle.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{vehicleTypeLabels[vehicle.type]}</TableCell>
                          <TableCell>{vehicle.plate || "-"}</TableCell>
                          <TableCell>{fuelTypeLabels[vehicle.fuel_type]}</TableCell>
                          <TableCell>{vehicle.uses_odometer ? "KM" : "Horímetro"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              vehicle.active 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {vehicle.active ? "Ativo" : "Inativo"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(vehicle)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
