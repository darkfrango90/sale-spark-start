import { useState } from "react";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";
import { useToast } from "@/hooks/use-toast";
import { ReceivingAccount } from "@/types/financial";

const ReceivingAccounts = () => {
  const { receivingAccounts, loadingAccounts, addReceivingAccount, updateReceivingAccount, deleteReceivingAccount } = useFinancial();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ReceivingAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<ReceivingAccount | null>(null);
  const [accountName, setAccountName] = useState('');

  const handleOpenDialog = (account?: ReceivingAccount) => {
    if (account) {
      setEditingAccount(account);
      setAccountName(account.name);
    } else {
      setEditingAccount(null);
      setAccountName('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAccount(null);
    setAccountName('');
  };

  const handleSubmit = async () => {
    if (!accountName.trim()) {
      toast({
        title: "Erro",
        description: "Informe o nome da conta.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAccount) {
        await updateReceivingAccount(editingAccount.id, { name: accountName });
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso.",
        });
      } else {
        await addReceivingAccount(accountName);
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar conta.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (account: ReceivingAccount) => {
    try {
      await updateReceivingAccount(account.id, { active: !account.active });
      toast({
        title: "Sucesso",
        description: `Conta ${account.active ? 'desativada' : 'ativada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      await deleteReceivingAccount(deletingAccount.id);
      setDeleteDialogOpen(false);
      setDeletingAccount(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir conta. Pode estar vinculada a recebimentos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-28 px-6 pb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Contas de Recebimento
            </CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </CardHeader>
          <CardContent>
            {loadingAccounts ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : receivingAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma conta cadastrada. Adicione sua primeira conta de recebimento.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-center">Ativa</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivingAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={account.active}
                          onCheckedChange={() => handleToggleActive(account)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenDialog(account)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setDeletingAccount(account);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Editar Conta' : 'Nova Conta de Recebimento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Nome da Conta *</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Ex: Banco do Brasil, Mercado Pago..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingAccount ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta "{deletingAccount?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReceivingAccounts;
