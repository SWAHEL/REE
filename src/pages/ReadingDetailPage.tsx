import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { readingsApi, metersApi, addressesApi, agentsApi, clientsApi } from '@/mocks/api';
import { Reading, Meter, Address, Agent, Client } from '@/types';
import { ArrowLeft, Droplets, Zap, Calendar, User, MapPin, FileText } from 'lucide-react';

const ReadingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reading, setReading] = useState<Reading | null>(null);
  const [meter, setMeter] = useState<Meter | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const readingData = await readingsApi.get(id);
        if (!readingData) {
          navigate('/readings');
          return;
        }
        setReading(readingData);

        const meterData = await metersApi.get(readingData.meterId);
        setMeter(meterData);

        if (meterData) {
          const [addressData, clientData] = await Promise.all([
            addressesApi.get(meterData.addressId),
            clientsApi.get(meterData.clientId),
          ]);
          setAddress(addressData);
          setClient(clientData);
        }

        const agentData = await agentsApi.get(readingData.agentId);
        setAgent(agentData);
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

  if (!reading) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/readings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Détail du Relevé</h1>
          <p className="text-muted-foreground">
            Relevé du {new Date(reading.date).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations du relevé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(reading.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Type</span>
              <Badge variant={reading.type === 'WATER' ? 'default' : 'secondary'}>
                {reading.type === 'WATER' ? (
                  <><Droplets className="h-3 w-3 mr-1" /> Eau</>
                ) : (
                  <><Zap className="h-3 w-3 mr-1" /> Électricité</>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Ancien index</span>
              <span className="font-mono text-lg">{reading.oldIndex}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Nouvel index</span>
              <span className="font-mono text-lg">{reading.newIndex}</span>
            </div>
            <div className="flex items-center justify-between py-2 bg-primary/5 rounded-lg px-3">
              <span className="font-medium">Consommation</span>
              <span className="text-xl font-bold text-primary">
                {reading.consumption} {reading.type === 'WATER' ? 'm³' : 'kWh'}
              </span>
            </div>
            {reading.notes && (
              <div className="pt-2">
                <span className="text-muted-foreground text-sm">Notes</span>
                <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">{reading.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meter & Location Info */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {reading.type === 'WATER' ? (
                  <Droplets className="h-5 w-5" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
                Compteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Identifiant</span>
                <span className="font-mono font-medium">{meter?.identifier}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Index actuel</span>
                <span className="font-mono">{meter?.currentIndex}</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/meters/${meter?.id}`)}
              >
                Voir le compteur
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-2 border-b">
                <span className="text-muted-foreground text-sm">Adresse complète</span>
                <p className="font-medium mt-1">
                  {address?.number} {address?.street}
                </p>
              </div>
              <div className="py-2 border-b">
                <span className="text-muted-foreground text-sm">Client</span>
                <p className="font-medium mt-1">{client?.name}</p>
                <p className="text-xs text-muted-foreground">{client?.externalId}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Nom</span>
                <span className="font-medium">{agent?.firstName} {agent?.lastName}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Téléphone</span>
                <span>{agent?.phone}</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/agents/${agent?.id}`)}
              >
                Voir l'agent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReadingDetailPage;
