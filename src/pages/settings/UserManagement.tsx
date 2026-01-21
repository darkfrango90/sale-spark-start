import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, ROLES, MODULES, Permission } from '@/types/user';
import TopMenu from '@/components/dashboard/TopMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCog, Loader2 } from 'lucide-react';

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, getNextAccessCode, user: currentUser, refreshUsers } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCode, setNextCode] = useState('001');
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    password: '',
    role: 'vendedor' as User['role'],
    active: true,
    permissions: [] as Permission[],
  });

  useEffect(() => {
    refreshUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      cpf: '',
      password: '',
      role: 'vendedor',
      active: true,
      permissions: [],
    });
    setEditingUser(null);
  };

  const openNewUserDialog = async () => {
    resetForm();
    const code = await getNextAccessCode();
    setNextCode(code);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      cpf: user.cpf,
      password: '',
      role: user.role,
      active: user.active,
      permissions: user.permissions,
    });
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setFormData((prev) => {
      const existingPermission = prev.permissions.find((p) => p.module === module);
      
      if (existingPermission) {
        const updatedPermissions = prev.permissions.map((p) => {
          if (p.module === module) {
            const newActions = checked
              ? [...p.actions, action]
              : p.actions.filter((a) => a !== action);
            return { ...p, actions: newActions };
          }
          return p;
        }).filter((p) => p.actions.length > 0);
        
        return { ...prev, permissions: updatedPermissions };
      } else if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, { module, actions: [action] }],
        };
      }
      
      return prev;
    });
  };

  const isActionChecked = (module: string, action: string): boolean => {
    const permission = formData.permissions.find((p) => p.module === module);
    return permission?.actions.includes(action) ?? false;
  };

  const handleSelectAllModule = (module: string, actions: readonly string[]) => {
    const permission = formData.permissions.find((p) => p.module === module);
    const allSelected = permission?.actions.length === actions.length;

    setFormData((prev) => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p.module !== module),
        };
      } else {
        const otherPermissions = prev.permissions.filter((p) => p.module !== module);
        return {
          ...prev,
          permissions: [...otherPermissions, { module, actions: [...actions] }],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name || !formData.cpf) {
        toast.error('Preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }

      if (!editingUser && !formData.password) {
        toast.error('A senha é obrigatória para novos usuários');
        setIsLoading(false);
        return;
      }

      if (editingUser) {
        const updateData: Partial<User> & { password?: string } = {
          name: formData.name,
          cpf: formData.cpf,
          role: formData.role,
          active: formData.active,
          permissions: formData.permissions,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(editingUser.id, updateData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        const newUser = await addUser({
          name: formData.name,
          cpf: formData.cpf,
          password: formData.password,
          role: formData.role,
          active: formData.active,
          permissions: formData.permissions,
        });
        toast.success(`Usuário criado com sucesso! Código de acesso: ${newUser.accessCode}`);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erro ao salvar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.accessCode === '001') {
      toast.error('Não é possível excluir o diretor principal');
      return;
    }
    if (user.id === currentUser?.id) {
      toast.error('Não é possível excluir o usuário logado');
      return;
    }
    
    try {
      await deleteUser(user.id);
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopMenu />
      <main className="pt-16 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="h-6 w-6" />
              <CardTitle>Gerenciamento de Usuários</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewUserDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="accessCode">Código de Acesso</Label>
                      <Input
                        id="accessCode"
                        value={editingUser?.accessCode ?? nextCode}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="role">Cargo</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: User['role']) =>
                          setFormData((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="name">Nome do Colaborador *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cpf: formatCPF(e.target.value),
                          }))
                        }
                        maxLength={14}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="password">
                        Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        required={!editingUser}
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, active: !!checked }))
                        }
                      />
                      <Label htmlFor="active" className="cursor-pointer">
                        Usuário Ativo
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Permissões de Acesso</Label>
                    <div className="grid gap-4">
                      {Object.entries(MODULES).map(([moduleKey, moduleData]) => (
                        <Card key={moduleKey} className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Checkbox
                              id={`module-${moduleKey}`}
                              checked={
                                formData.permissions.find((p) => p.module === moduleKey)
                                  ?.actions.length === moduleData.actions.length
                              }
                              onCheckedChange={() =>
                                handleSelectAllModule(moduleKey, moduleData.actions)
                              }
                            />
                            <Label
                              htmlFor={`module-${moduleKey}`}
                              className="font-medium cursor-pointer"
                            >
                              {moduleData.label}
                            </Label>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-6">
                            {moduleData.actions.map((action) => (
                              <div key={action} className="flex items-center gap-2">
                                <Checkbox
                                  id={`${moduleKey}-${action}`}
                                  checked={isActionChecked(moduleKey, action)}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(moduleKey, action, !!checked)
                                  }
                                />
                                <Label
                                  htmlFor={`${moduleKey}-${action}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {action}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono font-bold">
                      {user.accessCode}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>{ROLES[user.role]}</TableCell>
                    <TableCell>
                      <Badge variant={user.active ? 'default' : 'secondary'}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          disabled={user.accessCode === '001'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserManagement;
