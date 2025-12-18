import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/mocks/api';
import { User, UserFilters } from '@/types';
import { Plus, Filter, Shield, UserIcon } from 'lucide-react';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({});

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const data = await usersApi.list(filters);
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [filters]);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nom',
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.firstName} {item.lastName}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <span className="text-muted-foreground">{item.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (item) => (
        <Badge variant={item.role === 'SUPERADMIN' ? 'default' : 'secondary'} className="gap-1">
          {item.role === 'SUPERADMIN' ? (
            <Shield className="h-3 w-3" />
          ) : (
            <UserIcon className="h-3 w-3" />
          )}
          {item.role === 'SUPERADMIN' ? 'Super Admin' : 'Utilisateur'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date ajout',
      sortable: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      key: 'updatedAt',
      header: 'Dernière modif.',
      sortable: true,
      render: (item) => new Date(item.updatedAt).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground">Gestion des utilisateurs du backoffice</p>
        </div>
        <Button onClick={() => navigate('/admin/users/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <Select 
          value={filters.role || 'all'} 
          onValueChange={(v) => setFilters(f => ({ ...f, role: v === 'all' ? undefined : v as any }))}
        >
          <SelectTrigger className="w-40 bg-background">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Tous rôles</SelectItem>
            <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
            <SelectItem value="USER">Utilisateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Rechercher un utilisateur..."
        searchFields={['firstName', 'lastName', 'email']}
        isLoading={isLoading}
        emptyMessage="Aucun utilisateur trouvé"
        onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
      />
    </div>
  );
};

export default UsersPage;
