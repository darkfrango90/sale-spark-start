import { useState } from "react";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { PaymentMethod } from "@/types/sales";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodFormData {
  name: string;
  active: boolean;
}

const emptyFormData: PaymentMethodFormData = {
  name: '',
  active: true,
};

const PaymentMethods = () => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useSettings();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodFormData>(emptyFormData);

  const handleNew = () => {
    setEditingMethod(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      active: method.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (methodToDelete) {
      deletePaymentMethod(methodToDelete.id);
      toast({
        title: "Condição de pagamento excluída",
        description: `A condição "${methodToDelete.name}" foi excluída com sucesso.`,
      });
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da condição de pagamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, { name: formData.name, active: formData.active });
        toast({
          title: "Condição atualizada",
          description: `A condição "${formData.name}" foi atualizada com sucesso.`,
        });
      } else {
        await addPaymentMethod(formData.name);
        toast({
          title: "Condição cadastrada",
          description: `A condição "${formData.name}" foi cadastrada com sucesso.`,
        });
      }

      setIsDialogOpen(false);
      setFormData(emptyFormData);
      setEditingMethod(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-16 px-6 pb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Condições de Pagamento
            </CardTitle>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Condição
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Nenhuma condição de pagamento encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${method.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {method.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(method)}>
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
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Pix, Cartão de Crédito..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked as boolean }))}
              />
              <Label htmlFor="active" className="cursor-pointer">Condição Ativa</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMethod ? 'Salvar Alterações' : 'Salvar Condição'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a condição de pagamento "{methodToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentMethods;
