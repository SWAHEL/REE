import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { agentsApi, districtsApi } from '@/mocks/api';
import { Agent, District, AgentFilters } from '@/types';
import { Phone, Filter } from 'lucide-react';

const AgentsPage = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AgentFilters>({});

  useEffect(() => {
    districtsApi.list().then(setDistricts);
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        const data = await agentsApi.list(filters);
        setAgents(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadAgents();
  }, [filters]);

  const getDistrictName = (districtId: string) => {
    return districts.find(d => d.id === districtId)?.name || '-';
  };

  const columns: Column<Agent>[] = [
    {
      key: 'name',
      header: 'Nom',
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.firstName} {item.lastName}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Téléphone',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{item.phone}</span>
          {item.secondaryPhone && (
            <span className="text-muted-foreground text-sm">/ {item.secondaryPhone}</span>
          )}
        </div>
      ),
    },
    {
      key: 'districtId',
      header: 'Quartier',
      render: (item) => getDistrictName(item.districtId),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agents</h1>
        <p className="text-muted-foreground">Liste des agents releveurs</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <Select 
          value={filters.districtId || 'all'} 
          onValueChange={(v) => setFilters(f => ({ ...f, districtId: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-44 bg-background">
            <SelectValue placeholder="Quartier" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Tous quartiers</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={agents}
        columns={columns}
        searchPlaceholder="Rechercher un agent..."
        searchFields={['firstName', 'lastName', 'phone']}
        isLoading={isLoading}
        emptyMessage="Aucun agent trouvé"
        onRowClick={(agent) => navigate(`/agents/${agent.id}`)}
      />
    </div>
  );
};

export default AgentsPage;
