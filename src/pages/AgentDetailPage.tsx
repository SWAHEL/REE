import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { agentsApi, districtsApi } from '@/mocks/api';
import { Agent, District, AgentPerformance } from '@/types';
import { ArrowLeft, User, Phone, MapPin, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AgentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [performance, setPerformance] = useState<AgentPerformance[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [agentData, districtsData, performanceData] = await Promise.all([
          agentsApi.get(id),
          districtsApi.list(),
          agentsApi.getPerformance(id),
        ]);
        
        if (!agentData) {
          navigate('/agents');
          return;
        }
        
        setAgent(agentData);
        setDistricts(districtsData);
        setSelectedDistrict(agentData.districtId);
        setPerformance(performanceData);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleSaveDistrict = async () => {
    if (!id || !selectedDistrict) return;
    
    setIsSaving(true);
    try {
      await agentsApi.updateDistrict(id, selectedDistrict);
      setAgent(prev => prev ? { ...prev, districtId: selectedDistrict } : null);
      toast({
        title: "Quartier modifié",
        description: "Le quartier de l'agent a été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!agent) return null;

  const getDistrictName = (districtId: string) => {
    return districts.find(d => d.id === districtId)?.name || '-';
  };

  // Calculate average readings per day
  const totalReadings = performance.reduce((sum, p) => sum + p.readingsCount, 0);
  const daysWithReadings = performance.filter(p => p.readingsCount > 0).length;
  const avgPerDay = daysWithReadings > 0 ? (totalReadings / daysWithReadings).toFixed(1) : '0';

  // Prepare chart data (last 30 days)
  const chartData = performance.slice(-30).map(p => ({
    date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    relevés: p.readingsCount,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/agents')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {agent.firstName} {agent.lastName}
          </h1>
          <p className="text-muted-foreground">Détail de l'agent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Prénom</span>
              <span className="font-medium">{agent.firstName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Nom</span>
              <span className="font-medium">{agent.lastName}</span>
            </div>
            <div className="py-2 border-b">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Phone className="h-4 w-4" />
                <span>Téléphone principal</span>
              </div>
              <span className="font-medium">{agent.phone}</span>
            </div>
            {agent.secondaryPhone && (
              <div className="py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Phone className="h-4 w-4" />
                  <span>Téléphone secondaire</span>
                </div>
                <span className="font-medium">{agent.secondaryPhone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* District (Editable) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Quartier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quartier assigné</Label>
              <Select 
                value={selectedDistrict} 
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sélectionner un quartier" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveDistrict}
              disabled={selectedDistrict === agent.districtId || isSaving}
              className="w-full"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Moyenne relevés / jour</p>
              <p className="text-3xl font-bold text-primary">{avgPerDay}</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Total relevés (3 mois)</span>
              <span className="font-medium">{totalReadings}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Jours actifs</span>
              <span className="font-medium">{daysWithReadings}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Relevés par jour (30 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="relevés" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDetailPage;
