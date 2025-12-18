import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { metersApi, districtsApi, addressesApi } from '@/mocks/api';
import { Meter, District, Address, MeterFilters } from '@/types';
import { Droplets, Zap, Plus, Filter } from 'lucide-react';

const MetersPage = () => {
  const navigate = useNavigate();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MeterFilters>({});

  useEffect(() => {
    const loadInitialData = async () => {
      const [districtsData, addressesData] = await Promise.all([
        districtsApi.list(),
        addressesApi.list(),
      ]);
      setDistricts(districtsData);
      setAddresses(addressesData);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadMeters = async () => {
      setIsLoading(true);
      try {
        const data = await metersApi.list(filters);
        setMeters(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadMeters();
  }, [filters]);

  const getAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (!address) return '-';
    const full = `${address.number} ${address.street}`;
    return full.length > 35 ? full.slice(0, 35) + '...' : full;
  };

  const columns: Column<Meter>[] = [
    {
      key: 'identifier',
      header: 'Identifiant',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-medium">{item.identifier}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge variant={item.type === 'WATER' ? 'default' : 'secondary'} className="gap-1">
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
      key: 'addressId',
      header: 'Adresse',
      render: (item) => (
        <span className="text-muted-foreground">{getAddress(item.addressId)}</span>
      ),
    },
    {
      key: 'currentIndex',
      header: 'Index actuel',
      sortable: true,
      render: (item) => (
        <span className="font-mono">{item.currentIndex}</span>
      ),
    },
    {
      key: 'lastReadingDate',
      header: 'Dernier relevé',
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">
          {item.lastReadingDate 
            ? new Date(item.lastReadingDate).toLocaleDateString('fr-FR')
            : 'Jamais'
          }
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compteurs</h1>
          <p className="text-muted-foreground">Gestion des compteurs</p>
        </div>
        <Button onClick={() => navigate('/meters/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un compteur
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border">
        <Filter className="h-4 w-4 text-muted-foreground" />

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
      </div>

      <DataTable
        data={meters}
        columns={columns}
        searchPlaceholder="Rechercher par identifiant..."
        searchFields={['identifier']}
        isLoading={isLoading}
        emptyMessage="Aucun compteur trouvé"
        onRowClick={(meter) => navigate(`/meters/${meter.id}`)}
      />
    </div>
  );
};

export default MetersPage;
