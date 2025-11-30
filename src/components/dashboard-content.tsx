"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Users, Calendar, Ticket, TrendingUp, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { GraphicsPage } from "./graphics-page"
import { dashboardService, type DashboardStats } from "../../api"
import { toast } from "sonner"

export function DashboardContent() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dashboardService.getStats()
        if (response.data) {
          setStats(response.data)
        } else {
          setError("Impossible de charger les statistiques")
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err)
        setError(err.message || "Erreur lors du chargement des statistiques")
        toast.error(err.message || "Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  // Formater les revenus
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Préparer les données pour le graphique (événements par catégorie)
  const chartData = React.useMemo(() => {
    if (!stats?.events?.by_category) return []
    return stats.events.by_category
      .filter((item) => item.category && item.category.name) // Filtrer les catégories null
      .map((item) => ({
        name: item.category.name,
        value: item.events_count || 0,
      }))
  }, [stats])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-destructive text-lg">{error || "Impossible de charger les statistiques"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="p-8">
      <div className='mb-6 flex items-center justify-between space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <div className='flex items-center space-x-2'>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue='overview' className='space-y-6'>
        <div className='w-full overflow-x-auto pb-2'>
          <TabsList className='inline-flex'>
            <TabsTrigger value='overview'>Statistiques</TabsTrigger>
            <TabsTrigger value='analytics'>Graphiques</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Stats Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Revenus Totaux
                </CardTitle>
                <TrendingUp className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{formatCurrency(stats.transactions?.total_revenue || 0)}</div>
                <p className='text-muted-foreground text-xs'>
                  {formatCurrency(stats.transactions?.revenue_this_month || 0)} ce mois-ci
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Utilisateurs
                </CardTitle>
                <Users className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.users?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats.users?.active || 0} actifs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Événements</CardTitle>
                <Calendar className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.events?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats.events?.upcoming || 0} à venir
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Inscriptions
                </CardTitle>
                <Ticket className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.registrations?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats.registrations?.this_month || 0} ce mois-ci
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Transactions
                </CardTitle>
                <TrendingUp className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.transactions?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats.transactions?.successful || 0} réussies
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Tickets
                </CardTitle>
                <Ticket className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.tickets?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats.tickets?.validated || 0} validés
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Catégories
                </CardTitle>
                <Calendar className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.categories?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats.categories?.active || 0} actives
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Favoris
                </CardTitle>
                <Users className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.favorites?.total || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  Total des favoris
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Événements par Catégorie</CardTitle>
                <CardDescription>
                  Répartition des événements selon les catégories
                </CardDescription>
              </CardHeader>
              <CardContent className='ps-2'>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
                      <YAxis stroke="hsl(var(--color-muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Événements Populaires</CardTitle>
                <CardDescription>
                  Top {stats.events.popular?.filter((item) => item.event && item.event.uid).length || 0} des événements les plus populaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.events.popular && stats.events.popular.length > 0 ? (
                    stats.events.popular
                      .filter((item) => item.event && item.event.uid) // Filtrer les événements null
                      .slice(0, 5)
                      .map((item, idx) => (
                        <div key={item.event.uid || idx} className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                            {item.event.title
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "EV"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.event.title || "Événement sans titre"}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.event.location || "Lieu non spécifié"}</p>
                          </div>
                          <div className="text-sm font-medium">{item.registrations_count || 0} inscrits</div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Aucun événement populaire pour le moment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-6'>
          <GraphicsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
