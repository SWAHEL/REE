import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { metersApi, districtsApi } from '@/mocks/api';
import { Address, District } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Droplets, Zap, Search, MapPin, Check } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';

const MeterCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [type, setType] = useState<'WATER' | 'ELECTRICITY'>('WATER');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Address selection
  const [eligibleAddresses, setEligibleAddresses] = useState<Address[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [addressDistrictFilter, setAddressDistrictFilter] = useState<string>('all');
  const [addressSearch, setAddressSearch] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  useEffect(() => {
    districtsApi.list().then(setDistricts);
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const addresses = await metersApi.getEligibleAddresses(
          type,
          addressDistrictFilter === 'all' ? undefined : addressDistrictFilter,
          addressSearch || undefined
        );
        setEligibleAddresses(addresses);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, [type, addressDistrictFilter, addressSearch]);

  const getDistrictName = (districtId: string) => {
    return districts.find(d => d.id === districtId)?.name || '-';
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une adresse",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const meter = await metersApi.create({
        type,
        addressId: selectedAddress.id,
      });
      toast({
        title: "Compteur créé",
        description: `Compteur ${meter.identifier} créé avec succès`,
      });
      navigate('/meters');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addressColumns: Column<Address>[] = [
    {
      key: 'address',
      header: 'Adresse',
      render: (item) => (
        <span className="font-medium">{item.number} {item.street}</span>
      ),
    },
    {
      key: 'districtId',
      header: 'Quartier',
      render: (item) => getDistrictName(item.districtId),
    },
    {
      key: 'select',
      header: '',
      className: 'w-20',
      render: (item) => (
        <Button
          size="sm"
          variant={selectedAddress?.id === item.id ? 'default' : 'outline'}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAddress(item);
            setIsDialogOpen(false);
          }}
        >
          {selectedAddress?.id === item.id ? (
            <Check className="h-4 w-4" />
          ) : (
            'Choisir'
          )}
        </Button>
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
          <h1 className="text-2xl font-bold text-foreground">Ajouter un compteur</h1>
          <p className="text-muted-foreground">Créer un nouveau compteur</p>
        </div>
      </div>

      <Card className="shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du compteur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Type de compteur</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={type === 'WATER' ? 'default' : 'outline'}
                className="flex-1 h-20"
                onClick={() => {
                  setType('WATER');
                  setSelectedAddress(null);
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Droplets className="h-6 w-6" />
                  <span>Eau</span>
                </div>
              </Button>
              <Button
                type="button"
                variant={type === 'ELECTRICITY' ? 'default' : 'outline'}
                className="flex-1 h-20"
                onClick={() => {
                  setType('ELECTRICITY');
                  setSelectedAddress(null);
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-6 w-6" />
                  <span>Électricité</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Address Selection */}
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  {selectedAddress ? (
                    <div className="text-left">
                      <p className="font-medium">{selectedAddress.number} {selectedAddress.street}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDistrictName(selectedAddress.districtId)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sélectionner une adresse...</span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Sélectionner une adresse</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select 
                      value={addressDistrictFilter} 
                      onValueChange={setAddressDistrictFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Quartier" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">Tous</SelectItem>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <DataTable
                      data={eligibleAddresses}
                      columns={addressColumns}
                      isLoading={isLoadingAddresses}
                      emptyMessage={`Aucune adresse éligible pour un compteur ${type === 'WATER' ? 'd\'eau' : 'd\'électricité'}`}
                      pageSize={8}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground">
              Seules les adresses sans compteur {type === 'WATER' ? 'd\'eau' : 'd\'électricité'} sont affichées
            </p>
          </div>

          {/* Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Un identifiant à 9 chiffres sera généré automatiquement et l'index sera initialisé à 0.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('/meters')} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedAddress || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Création...' : 'Créer le compteur'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeterCreatePage;
