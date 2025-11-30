"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, Users } from "lucide-react"
import { toast } from "sonner"
import { eventsService, type EventRegistration, type Event as ApiEvent } from "../../api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function EventParticipantsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [participants, setParticipants] = React.useState<EventRegistration[]>([])
  const [loading, setLoading] = React.useState(true)
  const [event, setEvent] = React.useState<ApiEvent | null>(null)
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  // Charger les informations de l'événement
  React.useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return
      try {
        const response = await eventsService.getById(eventId)
        if (response.data) {
          setEvent(response.data)
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'événement:', err)
      }
    }
    loadEvent()
  }, [eventId])

  // Charger les participants
  const loadParticipants = React.useCallback(async (pageNum: number = 1) => {
    if (!eventId) {
      toast.error("ID d'événement manquant")
      return
    }
    try {
      setLoading(true)
      const response = await eventsService.getEventRegistrations(eventId, {
        page: pageNum,
        limit: 20,
        status: "REGISTERED"
      })
      
      console.log('Response complète:', response)
      
      if (response.data) {
        setParticipants(response.data.registrations || [])
        // La pagination peut être au même niveau que data ou dans data
        setPagination((response as any).pagination || null)
        if (response.data.event) {
          setEvent(response.data.event as any)
        }
      } else {
        setParticipants([])
        setPagination(null)
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des participants:', err)
      console.error('Détails de l\'erreur:', {
        message: err.message,
        error: err.error,
        status: err.status,
        response: err,
        eventId: eventId
      })
      
      // Message d'erreur plus détaillé selon le type d'erreur
      let errorMessage = "Erreur lors du chargement des participants"
      
      if (err.status === 401 || err.message?.includes("authentification") || err.message?.includes("token")) {
        errorMessage = "Vous devez être connecté pour voir les participants"
      } else if (err.status === 403 || err.message?.includes("interdit") || err.message?.includes("forbidden")) {
        errorMessage = "Vous n'avez pas la permission de voir les participants"
      } else if (err.status === 404 || err.message?.includes("trouvé") || err.message?.includes("not found")) {
        errorMessage = "Événement non trouvé"
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.error) {
        errorMessage = err.error
      }
      
      toast.error(errorMessage)
      setParticipants([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    loadParticipants(page)
  }, [page, loadParticipants])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateString
    }
  }

  const eventTitle = event?.title || "Événement"

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/events")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux événements
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Participants</h1>
        </div>
        <p className="text-muted-foreground">
          Liste des participants inscrits à l'événement : <strong>{eventTitle}</strong>
        </p>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Chargement des participants...</span>
        </div>
      ) : participants.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            Aucun participant inscrit pour le moment
          </p>
        </div>
      ) : (
        <>
          {/* Table des participants */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="text-right">Date d'inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((item) => (
                  <TableRow key={item.registration.uid} className="hover:bg-muted/50">
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        {item.user.profile_picture_url ? (
                          <AvatarImage 
                            src={item.user.profile_picture_url} 
                            alt={`${item.user.first_name} ${item.user.last_name}`} 
                          />
                        ) : null}
                        <AvatarFallback>
                          {item.user.first_name?.[0]?.toUpperCase() || ''}
                          {item.user.last_name?.[0]?.toUpperCase() || ''}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.user.first_name} {item.user.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.user.phone || "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(item.registration.registration_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages} 
                ({pagination.total} participant{pagination.total > 1 ? 's' : ''})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination!.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || loading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


