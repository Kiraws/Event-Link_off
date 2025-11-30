"use client"

import * as React from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Settings2, Loader2, Image as ImageIcon, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { eventsService, categoriesService, type Event as ApiEvent, type Category } from "../../../api"
import { toast } from "sonner"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { MapLocationPicker } from "@/components/MapLocationPicker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Textarea } from "@/components/ui/textarea"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

type EventRow = {
  id: string
  nom: string
  description?: string
  isMultiDay: boolean
  date?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  startDateTime?: string // ISO string complète
  endDateTime?: string // ISO string complète
  category: string
  category_uid?: string
  payant: "oui" | "non"
  organisateur: string
  location?: string
  hasCoordinates?: boolean
  latitude?: string
  longitude?: string
  places: number
  isPublished: boolean
  status?: 'draft' | 'published' | 'cancelled'
  image?: string
}

const formatDateTime = (s?: string) => {
  if (!s) return ""
  try {
    const date = new Date(s)
    if (isNaN(date.getTime())) return s
    return date.toLocaleString("fr-FR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit" 
    })
  } catch {
    return s
  }
}

const columns: ColumnDef<EventRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image
      
      return (
        <Avatar className="h-10 w-10">
          {imageUrl && imageUrl.startsWith('http') ? (
            <AvatarImage src={imageUrl} alt={row.original.nom} />
          ) : null}
          <AvatarFallback>
            <ImageIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">EVT-{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("nom")}</span>,
  },
  {
    id: "dates",
    header: "Dates",
    accessorFn: (row) => {
      if (row.isMultiDay && row.startDateTime && row.endDateTime) {
        return `${formatDateTime(row.startDateTime)} → ${formatDateTime(row.endDateTime)}`
      } else if (row.startDateTime) {
        return formatDateTime(row.startDateTime)
      }
      return ""
    },
    cell: ({ row }) => {
      if (row.original.isMultiDay && row.original.startDateTime && row.original.endDateTime) {
        return (
          <div className="flex flex-col text-xs">
            <span>{formatDateTime(row.original.startDateTime)}</span>
            <span className="text-muted-foreground">→ {formatDateTime(row.original.endDateTime)}</span>
          </div>
        )
      } else if (row.original.startDateTime) {
        return <span className="text-sm">{formatDateTime(row.original.startDateTime)}</span>
      }
      return <span className="text-muted-foreground">-</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
        {row.getValue("category")}
      </span>
    ),
  },
  {
    accessorKey: "payant",
    header: "Payant",
    cell: ({ row }) => {
      const v = row.getValue<"oui" | "non">("payant")
      const cls =
        v === "oui" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
          {v === "oui" ? "Oui" : "Non"}
        </span>
      )
    },
  },
  {
    accessorKey: "organisateur",
    header: "Organisateur",
  },
  {
    accessorKey: "places",
    header: "Places",
    cell: ({ row }) => <div className="">{row.getValue("places")}</div>,
  },
  {
    accessorKey: "isPublished",
    header: "Statut",
    cell: ({ row }) => {
      const isPublished = row.getValue<boolean>("isPublished")
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
          isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        }`}>
          {isPublished ? "Publié" : "Brouillon"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const onRefresh = (table.options.meta as any)?.onRefresh
      return <RowActions row={row.original} onRefresh={onRefresh} />
    },
    enableSorting: false,
    enableHiding: false,
  },
]

export default function EventsDataTable() {
  const [events, setEvents] = React.useState<ApiEvent[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Charger TOUTES les catégories pour le mapping (pas seulement les actives)
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await categoriesService.getAll()
        setCategories(categoriesResponse.data || [])
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories:', err)
        toast.error("Erreur lors du chargement des catégories")
      }
    }
    loadCategories()
  }, [])

  // Charger les événements
  const loadEvents = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const eventsResponse = await eventsService.getAll()
      setEvents(eventsResponse.data || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement des événements:', err)
      setError(err.message || "Erreur lors du chargement des événements")
      toast.error("Impossible de charger les événements")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Créer un map des catégories pour accès rapide
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach(cat => map.set(cat.uid, cat))
    return map
  }, [categories])

  // Formater les événements pour EventRow
  const data = React.useMemo<EventRow[]>(() => {
    return events.map((event) => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      
      // Récupérer le nom de la catégorie
      let categoryName = "Non catégorisé"
      // Vérifier d'abord si l'API retourne la catégorie complète
      if (event.category && typeof event.category === 'object' && 'name' in event.category) {
        categoryName = event.category.name
      } 
      // Sinon, chercher dans le map des catégories chargées
      else if (event.category_uid) {
        const category = categoryMap.get(event.category_uid)
        if (category) {
          categoryName = category.name
        } else {
          // Si la catégorie n'est pas trouvée dans le map, afficher un warning
          console.warn(`Catégorie non trouvée pour l'UID: ${event.category_uid}. Catégories chargées: ${categories.length}, Map size: ${categoryMap.size}`)
          categoryName = "Non catégorisé"
        }
      }

      // Extraire la date et l'heure
      const formatDateStr = (date: Date) => date.toISOString().split('T')[0]
      const formatTimeStr = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }

      return {
        id: event.uid,
        nom: event.title,
        description: event.description || '',
        isMultiDay: event.is_multi_day,
        date: event.is_multi_day ? undefined : formatDateStr(startDate),
        startDate: event.is_multi_day ? formatDateStr(startDate) : undefined,
        endDate: event.is_multi_day ? formatDateStr(endDate) : undefined,
        startTime: formatTimeStr(startDate),
        endTime: formatTimeStr(endDate),
        startDateTime: event.start_date, // ISO string complète pour le formatage
        endDateTime: event.end_date, // ISO string complète pour le formatage
        category: categoryName,
        category_uid: event.category_uid,
        payant: event.is_free ? "non" : "oui",
        organisateur: event.organizer || "Non spécifié",
        location: event.location || '',
        hasCoordinates: !!(event.latitude && event.longitude),
        latitude: event.latitude?.toString() || '',
        longitude: event.longitude?.toString() || '',
        places: event.max_capacity || 0,
        isPublished: event.status === "published" || event.status === "active",
        status: (event.status === "published" || event.status === "active") ? "published" as const : event.status === "cancelled" ? "cancelled" as const : "draft" as const,
        image: event.image_url,
      }
    })
  }, [events, categoryMap])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onRefresh: loadEvents,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-4">
        <Input
          placeholder="Filtrer par nom…"
          value={(table.getColumn("nom")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nom")?.setFilterValue(event.target.value)}
          className="w-64"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 />
              Voir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Basculer les colonnes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement des événements...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadEvents}>
                      Réessayer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun évènement.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function RowActions({ row, onRefresh }: { row: EventRow; onRefresh?: () => void }) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<EventRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(row.image || null)
  const [categories, setCategories] = React.useState<Category[]>([])

  // Charger les catégories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.getAll()
        const allCategories = response.data || []
        // Filtrer les catégories actives côté client
        const activeCategories = allCategories.filter((cat: Category) => cat.active === true)
        setCategories(activeCategories.length > 0 ? activeCategories : allCategories)
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories:', err)
        toast.error(err.message || "Erreur lors du chargement des catégories")
      }
    }
    loadCategories()
  }, [])

  const update = <K extends keyof EventRow>(key: K, value: EventRow[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  return (
    <div className="flex justify-end">
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2 border-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
            <DropdownMenuLabel className="text-gray-900 dark:text-gray-900">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setForm(row)
                setEditOpen(true)
              }}
              className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100"
            >
              Éditer
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                navigate(`/dashboard/events/${row.id}/participants`)
              }}
              className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100"
            >
              <Users className="mr-2 h-4 w-4" />
              Afficher les participants
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100">
                Supprimer
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'évènement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'évènement "{row.nom}" ?
              <br />
              <br />
              <strong>Note:</strong> L'événement sera marqué comme supprimé (soft delete). Il ne sera plus visible dans les listes, favoris ou inscriptions mais restera en base de données.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  setDeleting(true)
                  await eventsService.delete(row.id)
                  toast.success("Événement supprimé avec succès")
                  onRefresh?.()
                } catch (err: any) {
                  toast.error(err.message || "Erreur lors de la suppression")
                } finally {
                  setDeleting(false)
                }
              }}
              disabled={deleting}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setForm(null)
            setImageFile(null)
            setImagePreview(row.image || null)
          } else {
            // Réinitialiser l'image preview quand on ouvre l'éditeur
            setImagePreview(row.image || null)
            setImageFile(null)
          }
        }}
      >
        <SheetContent side="right" className="p-4 sm:p-6 flex flex-col overflow-hidden sm:max-w-2xl">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Mettre à jour l'évènement</SheetTitle>
            <SheetDescription>
              Modifiez les informations de l'évènement. Cliquez sur "Enregistrer les modifications" quand vous avez terminé.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto pr-2">
          {form && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!form) return

                try {
                  setSaving(true)
                  
                  // Upload de l'image si un nouveau fichier est sélectionné
                  let imageUrl: string | undefined = undefined
                  if (imageFile) {
                    imageUrl = await uploadImageToCloudinary(imageFile, 'events')
                    toast.success("Image uploadée avec succès")
                  } else if (row.image) {
                    // Garder l'image existante si aucune nouvelle image n'est sélectionnée
                    imageUrl = row.image
                  }
                  
                  // Construire les dates au format ISO
                  let start_date: string
                  let end_date: string
                  
                  if (form.isMultiDay && form.startDate && form.endDate) {
                    const startDateTime = new Date(`${form.startDate}T${form.startTime || '00:00'}:00`)
                    const endDateTime = new Date(`${form.endDate}T${form.endTime || '23:59'}:59`)
                    start_date = startDateTime.toISOString()
                    end_date = endDateTime.toISOString()
                  } else if (form.date) {
                    const startDateTime = new Date(`${form.date}T${form.startTime || '00:00'}:00`)
                    const endDateTime = new Date(`${form.date}T${form.endTime || '23:59'}:59`)
                    start_date = startDateTime.toISOString()
                    end_date = endDateTime.toISOString()
                  } else {
                    throw new Error("Les dates sont requises")
                  }

                  // Trouver la catégorie par nom (on devrait plutôt utiliser l'UID)
                  // Pour l'instant, on garde category_uid si disponible
                  
                  await eventsService.update(row.id, {
                    title: form.nom,
                    description: form.description || '',
                    location: form.location || '',
                    is_free: form.payant === "non",
                    organizer: form.organisateur,
                    max_capacity: form.places,
                    start_date,
                    end_date,
                    is_multi_day: form.isMultiDay,
                    status: form.status || (form.isPublished ? "published" : "draft"),
                    image_url: imageUrl,
                    category_uid: form.category_uid || undefined,
                    latitude: form.hasCoordinates && form.latitude ? parseFloat(form.latitude) : undefined,
                    longitude: form.hasCoordinates && form.longitude ? parseFloat(form.longitude) : undefined,
                  })

                  toast.success("Événement mis à jour avec succès")
                  setEditOpen(false)
                  setImageFile(null)
                  setImagePreview(null)
                  onRefresh?.()
                } catch (err: any) {
                  toast.error(err.message || "Erreur lors de la mise à jour")
                } finally {
                  setSaving(false)
                }
              }}
            >
              {/* Upload d'image en haut */}
              <div className="grid gap-3">
                <Label htmlFor="event-edit-image">Image de l'événement</Label>
                <div className="space-y-4">
                  <label
                    htmlFor="event-edit-image"
                    className="relative flex flex-col items-center justify-center w-full aspect-square max-w-xs mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                            Cliquer pour changer
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          PNG, JPG, GIF
                        </p>
                      </div>
                    )}
                    <input
                      id="event-edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    L'image sera stockée dans Cloudinary
                  </p>
                </div>
              </div>

              <FieldGroup className='grid grid-cols-1 gap-4'>
                <Field>
                  <FieldLabel>Titre</FieldLabel>
                  <Input
                    value={form.nom}
                    onChange={(e) => update("nom", e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={form.description || ''}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Décrivez l'événement"
                    className='min-h-24'
                  />
                </Field>

                {/* Durée: un jour vs plusieurs jours */}
                <Field>
                  <FieldLabel>Durée</FieldLabel>
                  <RadioGroup
                    value={form.isMultiDay ? 'multi' : 'single'}
                    onValueChange={(val) =>
                      update("isMultiDay", val === 'multi')
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="edit-duree-single" />
                      <Label htmlFor="edit-duree-single">Un jour</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multi" id="edit-duree-multi" />
                      <Label htmlFor="edit-duree-multi">Plusieurs jours</Label>
                    </div>
                  </RadioGroup>
                  <FieldDescription>
                    Choisissez "Un jour" pour une seule date, "Plusieurs jours" pour début/fin.
                  </FieldDescription>
                </Field>

                {/* Date fields based on Durée */}
                {!form.isMultiDay && (
                  <FieldGroup className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <Field>
                      <FieldLabel>Date</FieldLabel>
                      <Input
                        type='date'
                        value={form.date || ''}
                        onChange={(e) => update("date", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Heure de début</FieldLabel>
                      <Input
                        type='time'
                        value={form.startTime || ''}
                        onChange={(e) => update("startTime", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Heure de fin</FieldLabel>
                      <Input
                        type='time'
                        value={form.endTime || ''}
                        onChange={(e) => update("endTime", e.target.value)}
                        min={form.startTime || undefined}
                      />
                    </Field>
                  </FieldGroup>
                )}

                {form.isMultiDay && (
                  <FieldGroup className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Field>
                      <FieldLabel>Date de début</FieldLabel>
                      <Input
                        type='date'
                        value={form.startDate || ''}
                        onChange={(e) => update("startDate", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Heure de début</FieldLabel>
                      <Input
                        type='time'
                        value={form.startTime || ''}
                        onChange={(e) => update("startTime", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Date de fin</FieldLabel>
                      <Input
                        type='date'
                        value={form.endDate || ''}
                        min={form.startDate || undefined}
                        onChange={(e) => update("endDate", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Heure de fin</FieldLabel>
                      <Input
                        type='time'
                        value={form.endTime || ''}
                        onChange={(e) => update("endTime", e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                )}

                <FieldSeparator />

                {/* Location avec carte OpenStreetMap */}
                <Field>
                  <FieldLabel>Lieu</FieldLabel>
                  <MapLocationPicker
                    location={form.location || ''}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onLocationChange={(location) => {
                      update("location", location)
                      update("hasCoordinates", true)
                    }}
                    onCoordinatesChange={(lat, lng) => {
                      update("latitude", lat)
                      update("longitude", lng)
                      update("hasCoordinates", true)
                    }}
                  />
                  <FieldDescription>
                    Recherchez un lieu ou cliquez sur la carte pour définir l'emplacement
                  </FieldDescription>
                </Field>

                <FieldSeparator />

                {/* Catégorie */}
                <Field>
                  <FieldLabel>Catégorie</FieldLabel>
                  <Select
                    value={form.category_uid || undefined}
                    onValueChange={(value) => update("category_uid", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.uid} value={category.uid}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Aucune catégorie disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Choisissez la catégorie de l'événement
                  </FieldDescription>
                </Field>

                {/* Payant: use RadioGroup and bind to state */}
                <Field>
                  <FieldLabel>Payant</FieldLabel>
                  <RadioGroup
                    value={form.payant}
                    onValueChange={(val) =>
                      update("payant", val as "oui" | "non")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="edit-payant-oui" />
                      <Label htmlFor="edit-payant-oui">Oui</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="edit-payant-non" />
                      <Label htmlFor="edit-payant-non">Non</Label>
                    </div>
                  </RadioGroup>
                </Field>

                <Field>
                  <FieldLabel>Nom d'organisateur</FieldLabel>
                  <Input
                    type='text'
                    value={form.organisateur}
                    onChange={(e) => update("organisateur", e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Nombre de places</FieldLabel>
                  <Input
                    type='number'
                    min={0}
                    value={form.places}
                    onChange={(e) => update("places", Number(e.target.value))}
                  />
                </Field>

                <Field>
                  <FieldLabel>Statut</FieldLabel>
                  <Select
                    value={form.status || (form.isPublished ? 'published' : 'draft')}
                    onValueChange={(value) => {
                      update("status", value as 'draft' | 'published' | 'cancelled')
                      update("isPublished", value === 'published')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Le statut détermine la visibilité de l'événement
                  </FieldDescription>
                </Field>
              </FieldGroup>


                <div className='flex justify-end gap-2 pt-2'>
                  <Button variant='outline' type='button' onClick={() => setEditOpen(false)}>
                    Annuler
                  </Button>
                  <Button type='submit' disabled={saving}>
                    {saving ? 'Enregistrement...' : "Enregistrer les modifications"}
                  </Button>
                </div>
            </form>
          )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
