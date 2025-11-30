"use client"

import * as React from "react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardService, type DashboardStats } from "../../api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const COLORS = [
  "hsl(var(--color-chart-1))",
  "hsl(var(--color-chart-2))",
  "hsl(var(--color-chart-3))",
  "hsl(var(--color-chart-4))",
]

export function GraphicsPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const response = await dashboardService.getStats()
        if (response.data) {
          setStats(response.data)
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err)
        toast.error(err.message || "Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  // Préparer les données pour le graphique des revenus
  // Utilisation des vraies données de transactions disponibles
  const revenueData = React.useMemo(() => {
    if (!stats?.transactions) return []
    
    const now = new Date()
    const months = []
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    
    const totalRevenue = stats.transactions.total_revenue || 0
    const revenueThisMonth = stats.transactions.revenue_this_month || 0
    const previousMonthsRevenue = totalRevenue - revenueThisMonth
    
    // Créer les 6 derniers mois avec les données réelles
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthNames[date.getMonth()]
      
      if (i === 0) {
        // Mois actuel : utiliser revenue_this_month (vraie donnée)
        months.push({
          month: monthName,
          revenue: revenueThisMonth,
          profit: Math.round(revenueThisMonth * 0.7) // Estimation bénéfice à 70% du revenu
        })
      } else {
        // Mois précédents : répartition du reste du total sur les 5 mois précédents
        const estimatedRevenue = Math.round(previousMonthsRevenue / 5)
        months.push({
          month: monthName,
          revenue: estimatedRevenue,
          profit: Math.round(estimatedRevenue * 0.7) // Estimation bénéfice à 70% du revenu
        })
      }
    }
    
    return months
  }, [stats])

  // Préparer les données pour le graphique des événements par mois
  const chartData = React.useMemo(() => {
    if (!stats?.events) return []
    
    const now = new Date()
    const months = []
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"]
    
    // Créer les 6 derniers mois avec estimation basée sur les données totales
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthNames[date.getMonth()]
      
      months.push({
        name: monthName,
        value: Math.round((stats.events.total || 0) / 6),
        users: Math.round((stats.registrations?.total || 0) / 6)
      })
    }
    
    return months
  }, [stats])

  // Préparer les données pour le graphique en camembert (catégories)
  const pieData = React.useMemo(() => {
    if (!stats?.events?.by_category) return []
    
    return stats.events.by_category
      .filter((item) => item.category && item.category.name)
      .map((item) => ({
        name: item.category.name,
        value: item.events_count || 0,
      }))
  }, [stats])

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des graphiques...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Aucune donnée disponible</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vue d'ensemble des événements</CardTitle>
            <CardDescription>Nombre d'événements par mois</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="value" name="Événements" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution par catégorie</CardTitle>
            <CardDescription>Répartition des événements par catégorie</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="hsl(var(--color-primary))"
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune catégorie disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des inscrriptions</CardTitle>
            <CardDescription>Tendance des utilisateurs inscrits par mois</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Événements" stroke="hsl(var(--color-primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" name="Inscriptions" stroke="hsl(var(--color-accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus et bénéfices</CardTitle>
            <CardDescription>
              Revenus total: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(stats.transactions?.total_revenue || 0)} | 
              Ce mois: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(stats.transactions?.revenue_this_month || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis 
                    stroke="hsl(var(--color-muted-foreground))"
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                      return value.toString()
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => {
                      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(value)
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenus" 
                    stroke="hsl(var(--color-primary))" 
                    fill="hsl(var(--color-primary))" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="Bénéfices (estimé)" 
                    stroke="hsl(var(--color-accent))" 
                    fill="hsl(var(--color-accent))" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée de revenu disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
