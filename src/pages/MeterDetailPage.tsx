import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { metersApi, addressesApi, clientsApi, districtsApi } from '@/mocks/api';
import { Meter, Address, Client, Reading, District } from '@/types';
import { ArrowLeft, Droplets, Zap, MapPin, User, Calendar, ChevronRight } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';

const MeterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meter, setMeter] = useState<Meter | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const meterData = await metersApi.get(id);
        if (!meterData) {
          navigate('/meters');
          return;
        }
        setMeter(meterData);

        const [addressData, clientData, historyData, districtsData] = await Promise.all([
          addressesApi.get(meterData.addressId),
          clientsApi.get(meterData.clientId),
          metersApi.getHistory(id, 10),
          districtsApi.list(),
        ]);
        
        setAddress(addressData);
        setClient(clientData);
        setHistory(historyData);
        
        if (addressData) {
          const dist = districtsData.find(d => d.id === addressData.districtId);
          setDistrict(dist || null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!meter) return null;

  const historyColumns: Column<Reading>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString('fr-FR'),
    },
    {
      key: 'oldIndex',
      header: 'Ancien index',
      render: (item) => <span className="font-mono">{item.oldIndex}</span>,
    },
    {
      key: 'newIndex',
      header: 'Nouvel index',
      render: (item) => <span className="font-mono">{item.newIndex}</span>,
    },
    {
      key: 'consumption',
      header: 'Consommation',
      render: (item) => (
        <span className="font-medium">
          {item.consumption} {item.type === 'WATER' ? 'm³' : 'kWh'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/meters')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compteur {meter.identifier}</h1>
          <p className="text-muted-foreground">Détails et historique</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meter Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {meter.type === 'WATER' ? (
                <Droplets className="h-5 w-5" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Identifiant</span>
              <span className="font-mono font-medium">{meter.identifier}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Type</span>
              <Badge variant={meter.type === 'WATER' ? 'default' : 'secondary'}>
                {meter.type === 'WATER' ? 'Eau' : 'Électricité'}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Index actuel</span>
              <span className="font-mono text-lg font-bold">{meter.currentIndex}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Dernier relevé</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {meter.lastReadingDate 
                  ? new Date(meter.lastReadingDate).toLocaleDateString('fr-FR')
                  : 'Jamais'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Créé le</span>
              <span>{new Date(meter.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Address Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-2 border-b">
              <span className="text-muted-foreground text-sm">Adresse</span>
              <p className="font-medium mt-1">
                {address?.number} {address?.street}
              </p>
            </div>
            <div className="py-2 border-b">
              <span className="text-muted-foreground text-sm">Quartier</span>
              <p className="font-medium mt-1">{district?.name || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-2 border-b">
              <span className="text-muted-foreground text-sm">Nom</span>
              <p className="font-medium mt-1">{client?.name}</p>
            </div>
            <div className="py-2">
              <span className="text-muted-foreground text-sm">ID Externe</span>
              <p className="font-mono mt-1">{client?.externalId}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des 10 derniers relevés</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/readings?meterId=${meter.id}`)}
          >
            Plus de détails
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={history}
            columns={historyColumns}
            pageSize={10}
            emptyMessage="Aucun relevé enregistré"
            onRowClick={(reading) => navigate(`/readings/${reading.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MeterDetailPage;
