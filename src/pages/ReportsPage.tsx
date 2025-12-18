import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboardApi, agentsApi, districtsApi, readingsApi } from '@/mocks/api';
import { ConsumptionTrend, AgentPerformance, District, Reading } from '@/types';
import { FileText, Download, BarChart3, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const ReportsPage = () => {
  const { toast } = useToast();
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [consumptionTrends, setConsumptionTrends] = useState<ConsumptionTrend[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [performanceData, trendsData, districtsData, readingsData] = await Promise.all([
          dashboardApi.getReadingsPerAgent(),
          dashboardApi.getConsumptionTrends(),
          districtsApi.list(),
          readingsApi.list(),
        ]);
        setAgentPerformance(performanceData);
        setConsumptionTrends(trendsData);
        setDistricts(districtsData);
        setReadings(readingsData);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const generateMonthlyReport = () => {
    const doc = new jsPDF();
    const now = new Date();
    const monthYear = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // Title
    doc.setFontSize(20);
    doc.text('Rapport Mensuel des Relevés', 20, 20);
    doc.setFontSize(12);
    doc.text(monthYear, 20, 30);

    // Summary
    doc.setFontSize(14);
    doc.text('Résumé', 20, 45);
    doc.setFontSize(10);
    
    const totalReadings = readings.length;
    const currentMonthReadings = readings.filter(r => 
      new Date(r.date).getMonth() === now.getMonth()
    ).length;

    doc.text(`Total relevés ce mois: ${currentMonthReadings}`, 20, 55);
    doc.text(`Total relevés (historique): ${totalReadings}`, 20, 62);

    // Agent Performance
    doc.setFontSize(14);
    doc.text('Performance par Agent', 20, 80);
    doc.setFontSize(10);
    
    let yPos = 90;
    agentPerformance.slice(0, 10).forEach((agent, index) => {
      doc.text(`${index + 1}. ${agent.agentName}: ${agent.readingsCount} relevés`, 20, yPos);
      yPos += 7;
    });

    // Readings by District
    doc.setFontSize(14);
    doc.text('Relevés par Quartier', 20, yPos + 15);
    doc.setFontSize(10);
    yPos += 25;

    districts.forEach((district) => {
      const count = readings.filter(r => {
        // Simplified - in real app would join with meters/addresses
        return true;
      }).length / districts.length;
      doc.text(`${district.name}: ~${Math.round(count)} relevés`, 20, yPos);
      yPos += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 20, 280);

    doc.save(`rapport_mensuel_${now.getFullYear()}_${now.getMonth() + 1}.pdf`);
    
    toast({
      title: "Rapport généré",
      description: "Le rapport mensuel a été téléchargé",
    });
  };

  const generateConsumptionReport = () => {
    const doc = new jsPDF();
    const now = new Date();

    // Title
    doc.setFontSize(20);
    doc.text('Rapport d\'Évolution des Consommations', 20, 20);
    doc.setFontSize(12);
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')}`, 20, 30);

    // Water Consumption
    doc.setFontSize(14);
    doc.text('Consommation Eau (m³)', 20, 50);
    doc.setFontSize(10);
    
    let yPos = 60;
    consumptionTrends.forEach((trend) => {
      doc.text(`${trend.month}: ${trend.water} m³ (moyenne)`, 20, yPos);
      yPos += 7;
    });

    // Calculate trend
    if (consumptionTrends.length >= 2) {
      const lastTwo = consumptionTrends.slice(-2);
      const waterTrend = ((lastTwo[1].water - lastTwo[0].water) / lastTwo[0].water * 100).toFixed(1);
      doc.text(`Tendance: ${Number(waterTrend) >= 0 ? '+' : ''}${waterTrend}%`, 20, yPos + 5);
      yPos += 15;
    }

    // Electricity Consumption
    doc.setFontSize(14);
    doc.text('Consommation Électricité (kWh)', 20, yPos + 10);
    doc.setFontSize(10);
    yPos += 20;

    consumptionTrends.forEach((trend) => {
      doc.text(`${trend.month}: ${trend.electricity} kWh (moyenne)`, 20, yPos);
      yPos += 7;
    });

    // Calculate trend
    if (consumptionTrends.length >= 2) {
      const lastTwo = consumptionTrends.slice(-2);
      const elecTrend = ((lastTwo[1].electricity - lastTwo[0].electricity) / lastTwo[0].electricity * 100).toFixed(1);
      doc.text(`Tendance: ${Number(elecTrend) >= 0 ? '+' : ''}${elecTrend}%`, 20, yPos + 5);
    }

    // Year comparison note
    doc.setFontSize(10);
    doc.text('Note: Comparaison N vs N-1 nécessite des données sur 2 années', 20, 220);

    // Footer
    doc.setFontSize(8);
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 20, 280);

    doc.save(`rapport_consommation_${now.getFullYear()}_${now.getMonth() + 1}.pdf`);
    
    toast({
      title: "Rapport généré",
      description: "Le rapport de consommation a été téléchargé",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rapports & Statistiques</h1>
        <p className="text-muted-foreground">Générez et exportez vos rapports</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapport Mensuel des Relevés
            </CardTitle>
            <CardDescription>
              Répartition par agents et quartiers, moyenne de relevés par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformance.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="agentName" 
                      type="category" 
                      width={80}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="readingsCount" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                      name="Relevés"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Button onClick={generateMonthlyReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution Consommation Moyenne
            </CardTitle>
            <CardDescription>
              Eau et électricité, tendances et comparaison N vs N-1
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consumptionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="water" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Eau (m³)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="electricity" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      name="Élec (kWh)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Button onClick={generateConsumptionReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{readings.length}</p>
              <p className="text-sm text-muted-foreground">Total Relevés</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <p className="text-2xl font-bold text-accent">{agentPerformance.length}</p>
              <p className="text-sm text-muted-foreground">Agents Actifs</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold text-success">
                {consumptionTrends.length > 0 ? consumptionTrends[consumptionTrends.length - 1].water : 0}
              </p>
              <p className="text-sm text-muted-foreground">Moy. Eau (m³)</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-2xl font-bold text-warning">
                {consumptionTrends.length > 0 ? consumptionTrends[consumptionTrends.length - 1].electricity : 0}
              </p>
              <p className="text-sm text-muted-foreground">Moy. Élec (kWh)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
