import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { readingsApi, districtsApi, agentsApi, metersApi, addressesApi } from '@/mocks/api';
import { Reading, District, Agent, Meter, Address, ReadingFilters } from '@/types';
import { Droplets, Zap, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ReadingsPage = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<ReadingFilters>({});

  useEffect(() => {
    const loadInitialData = async () => {
      const [districtsData, agentsData, metersData, addressesData] = await Promise.all([
        districtsApi.list(),
        agentsApi.list(),
        metersApi.list(),
        addressesApi.list(),
      ]);
      setDistricts(districtsData);
      setAgents(agentsData);
      setMeters(metersData);
      setAddresses(addressesData);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadReadings = async () => {
      setIsLoading(true);
      try {
        const data = await readingsApi.list(filters);
        setReadings(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadReadings();
  }, [filters]);

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : '-';
  };

  const getMeterAddress = (meterId: string) => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return '-';
    const address = addresses.find(a => a.id === meter.addressId);
    if (!address) return '-';
    const fullAddress = `${address.number} ${address.street}`;
    return fullAddress.length > 30 ? fullAddress.slice(0, 30) + '...' : fullAddress;
  };

  const columns: Column<Reading>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    {
      key: 'agentId',
      header: 'Agent',
      render: (item) => getAgentName(item.agentId),
    },
    {
      key: 'address',
      header: 'Adresse',
      render: (item) => (
        <span className="text-muted-foreground">{getMeterAddress(item.meterId)}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge 
          variant={item.type === 'WATER' ? 'default' : 'secondary'}
          className="gap-1"
        >
          {item.type === 'WATER' ? (
            <Droplets className="h-3 w-3" />
          ) : (
            <Zap className="h-3 w-3" />
          )}
          {item.type === 'WATER' ? 'Eau' : 'Électricité'}
        </Badge>
      ),
    },
    {
      key: 'consumption',
      header: 'Consommation',
      sortable: true,
      render: (item) => (
        <span className="font-medium">
          {item.consumption} {item.type === 'WATER' ? 'm³' : 'kWh'}
        </span>
      ),
    },
  ];

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relevés</h1>
        <p className="text-muted-foreground">Liste des relevés de compteurs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        <Input
          type="date"
          className="w-auto"
          value={filters.date || ''}
          onChange={(e) => setFilters(f => ({ ...f, date: e.target.value || undefined }))}
        />

        <Select 
          value={filters.districtId || 'all'} 
          onValueChange={(v) => setFilters(f => ({ ...f, districtId: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-40 bg-background">
            <SelectValue placeholder="Quartier" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Tous quartiers</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.agentId || 'all'} 
          onValueChange={(v) => setFilters(f => ({ ...f, agentId: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-44 bg-background">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Tous agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.firstName} {a.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.type || 'all'} 
          onValueChange={(v) => setFilters(f => ({ ...f, type: v === 'all' ? undefined : v as any }))}
        >
          <SelectTrigger className="w-36 bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="WATER">Eau</SelectItem>
            <SelectItem value="ELECTRICITY">Électricité</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Effacer
          </Button>
        )}
      </div>

      <DataTable
        data={readings}
        columns={columns}
        searchPlaceholder="Rechercher par n° compteur..."
        searchFields={['meterId']}
        isLoading={isLoading}
        emptyMessage="Aucun relevé trouvé"
        onRowClick={(reading) => navigate(`/readings/${reading.id}`)}
      />
    </div>
  );
};

export default ReadingsPage;
