import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useSuppliers } from "@/contexts/SupplierContext";
import { Supplier } from "@/types/supplier";
import TopMenu from "@/components/dashboard/TopMenu";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 10);
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
};

const formatCellphone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  return numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

interface SupplierFormData {
  code: string;
  name: string;
  tradeName: string;
  type: 'fisica' | 'juridica';
  cpfCnpj: string;
  rgIe: string;
  email: string;
  phone: string;
  cellphone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  birthDate: string;
  notes: string;
  active: boolean;
}

const emptyFormData: SupplierFormData = {
  code: '',
  name: '',
  tradeName: '',
  type: 'juridica',
  cpfCnpj: '',
  rgIe: '',
  email: '',
  phone: '',
  cellphone: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  birthDate: '',
  notes: '',
  active: true
};

const SupplierManagement = () => {
  const { toast } = useToast();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, getNextSupplierCode } = useSuppliers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>(emptyFormData);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.includes(searchTerm) ||
    supplier.cpfCnpj.includes(searchTerm)
  );

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        code: supplier.code,
        name: supplier.name,
        tradeName: supplier.tradeName || '',
        type: supplier.type,
        cpfCnpj: supplier.cpfCnpj,
        rgIe: supplier.rgIe || '',
        email: supplier.email || '',
        phone: supplier.phone,
        cellphone: supplier.cellphone || '',
        zipCode: supplier.zipCode || '',
        street: supplier.street || '',
        number: supplier.number || '',
        complement: supplier.complement || '',
        neighborhood: supplier.neighborhood || '',
        city: supplier.city || '',
        state: supplier.state || '',
        birthDate: supplier.birthDate || '',
        notes: supplier.notes || '',
        active: supplier.active
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        ...emptyFormData,
        code: getNextSupplierCode()
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    setFormData(emptyFormData);
  };

  const handleTypeChange = (value: 'fisica' | 'juridica') => {
    setFormData(prev => ({
      ...prev,
      type: value,
      cpfCnpj: '',
      rgIe: '',
      tradeName: value === 'fisica' ? '' : prev.tradeName
    }));
  };

  const handleCpfCnpjChange = (value: string) => {
    const formatted = formData.type === 'fisica' ? formatCPF(value) : formatCNPJ(value);
    setFormData(prev => ({ ...prev, cpfCnpj: formatted }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do fornecedor é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.cpfCnpj.trim()) {
      toast({
        title: "Erro",
        description: formData.type === 'fisica' ? "O CPF é obrigatório." : "O CNPJ é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const supplierData = {
      code: formData.code,
      name: formData.name,
      tradeName: formData.type === 'juridica' ? formData.tradeName || undefined : undefined,
      type: formData.type,
      cpfCnpj: formData.cpfCnpj,
      rgIe: formData.rgIe || undefined,
      email: formData.email || undefined,
      phone: formData.phone,
      cellphone: formData.cellphone || undefined,
      zipCode: formData.zipCode || undefined,
      street: formData.street || undefined,
      number: formData.number || undefined,
      complement: formData.complement || undefined,
      neighborhood: formData.neighborhood || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      birthDate: formData.birthDate || undefined,
      notes: formData.notes || undefined,
      active: formData.active
    };

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso!"
        });
      } else {
        await addSupplier(supplierData);
        toast({
          title: "Sucesso",
          description: "Fornecedor cadastrado com sucesso!"
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar fornecedor.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await deleteSupplier(supplierToDelete.id);
        toast({
          title: "Sucesso",
          description: "Fornecedor excluído com sucesso!"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir fornecedor.",
          variant: "destructive"
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-16 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cadastro de Fornecedores</h1>
              <p className="text-muted-foreground">Gerencie os fornecedores do sistema</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Fornecedor
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-24">Tipo</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum fornecedor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.code}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          supplier.type === 'fisica' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {supplier.type === 'fisica' ? 'Física' : 'Jurídica'}
                        </span>
                      </TableCell>
                      <TableCell>{supplier.cpfCnpj}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.city || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          supplier.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {supplier.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(supplier)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Supplier Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Código e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Pessoa</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleTypeChange(value as 'fisica' | 'juridica')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <Label htmlFor="fisica" className="cursor-pointer">Pessoa Física</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <Label htmlFor="juridica" className="cursor-pointer">Pessoa Jurídica</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">DADOS BÁSICOS</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {formData.type === 'fisica' ? 'Nome Completo' : 'Razão Social'} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={formData.type === 'fisica' ? 'Digite o nome completo' : 'Digite a razão social'}
                  />
                </div>
                {formData.type === 'juridica' && (
                  <div className="space-y-2">
                    <Label htmlFor="tradeName">Nome Fantasia</Label>
                    <Input
                      id="tradeName"
                      value={formData.tradeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value }))}
                      placeholder="Digite o nome fantasia"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">
                    {formData.type === 'fisica' ? 'CPF' : 'CNPJ'} *
                  </Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => handleCpfCnpjChange(e.target.value)}
                    placeholder={formData.type === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rgIe">
                    {formData.type === 'fisica' ? 'RG' : 'Inscrição Estadual'}
                  </Label>
                  <Input
                    id="rgIe"
                    value={formData.rgIe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rgIe: e.target.value }))}
                    placeholder={formData.type === 'fisica' ? 'Digite o RG' : 'Digite a IE'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    {formData.type === 'fisica' ? 'Data de Nascimento' : 'Data de Fundação'}
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">CONTATO</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone">Celular</Label>
                  <Input
                    id="cellphone"
                    value={formData.cellphone}
                    onChange={(e) => setFormData(prev => ({ ...prev, cellphone: formatCellphone(e.target.value) }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">ENDEREÇO</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: formatCEP(e.target.value) }))}
                    placeholder="00000-000"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Nome da rua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="Nº"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                    placeholder="Apto, Sala..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BR.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">OBSERVAÇÕES</h3>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o fornecedor..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked === true }))}
              />
              <Label htmlFor="active" className="cursor-pointer">Fornecedor Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingSupplier ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{supplierToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierManagement;
