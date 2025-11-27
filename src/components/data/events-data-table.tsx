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
import { ArrowUpDown, MoreHorizontal, Settings2 } from 'lucide-react'
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
import { Switch } from "@/components/ui/switch"

type EventRow = {
  id: string
  nom: string
  isMultiDay: boolean
  date?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  category: string
  payant: "oui" | "non"
  organisateur: string
  places: number
  isPublished: boolean
  image?: string
}

const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString("fr-FR") : "")

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
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span>
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
    accessorFn: (row) =>
      row.isMultiDay
        ? `${formatDate(row.startDate)} → ${formatDate(row.endDate)}`
        : `${formatDate(row.date)}`,
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
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
    cell: ({ row }) => <RowActions row={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
]

export default function EventsDataTable() {
  const data = React.useMemo<EventRow[]>(
    () => [
      { id: "EVT-001", nom: "Conférence Tech 2025", isMultiDay: true, startDate: "2025-03-12", endDate: "2025-03-14", startTime: "09:00", endTime: "17:00", category: "Conférence", payant: "oui", organisateur: "TechCorp", places: 250, isPublished: true, image: "https://example.com/image1.jpg" },
      { id: "EVT-002", nom: "Atelier Design", isMultiDay: false, date: "2025-04-05", startTime: "14:00", endTime: "18:00", category: "Atelier", payant: "non", organisateur: "Design Hub", places: 40, isPublished: true, image: "https://example.com/image2.jpg" },
      { id: "EVT-003", nom: "Meetup JS", isMultiDay: false, date: "2025-05-02", startTime: "19:00", endTime: "21:00", category: "Meetup", payant: "non", organisateur: "Dev Community", places: 120, isPublished: false, image: "https://example.com/image3.jpg" },
      { id: "EVT-004", nom: "Salon Entreprises", isMultiDay: true, startDate: "2025-06-20", endDate: "2025-06-22", startTime: "10:00", endTime: "18:00", category: "Salon", payant: "oui", organisateur: "Business Expo", places: 500, isPublished: true, image: "https://example.com/image4.jpg" },
      { id: "EVT-005", nom: "Hackathon AI", isMultiDay: true, startDate: "2025-07-10", endDate: "2025-07-12", startTime: "08:00", endTime: "20:00", category: "Hackathon", payant: "non", organisateur: "AI Labs", places: 100, isPublished: false, image: "https://example.com/image5.jpg" },
      { id: "EVT-006", nom: "Forum Étudiants", isMultiDay: false, date: "2025-08-28", startTime: "13:00", endTime: "17:00", category: "Forum", payant: "non", organisateur: "Université Centrale", places: 300, isPublished: true, image: "https://example.com/image6.jpg" },
      { id: "EVT-007", nom: "Webinar Sécurité", isMultiDay: false, date: "2025-09-09", startTime: "15:00", endTime: "16:30", category: "Webinar", payant: "oui", organisateur: "SecOps", places: 1000, isPublished: true, image: "https://example.com/image7.jpg" },
      { id: "EVT-008", nom: "Concert d'été", isMultiDay: false, date: "2025-07-30", startTime: "20:00", endTime: "23:00", category: "Concert", payant: "oui", organisateur: "City Events", places: 800, isPublished: false, image: "https://example.com/image8.jpg" },
      { id: "EVT-009", nom: "Séminaire RH", isMultiDay: true, startDate: "2025-10-03", endDate: "2025-10-04", startTime: "09:00", endTime: "17:00", category: "Séminaire", payant: "oui", organisateur: "PeopleFirst", places: 60, isPublished: true, image: "https://example.com/image9.jpg" },
      { id: "EVT-010", nom: "Formation Node.js", isMultiDay: false, date: "2025-11-15", startTime: "10:00", endTime: "16:00", category: "Formation", payant: "non", organisateur: "CodeSchool", places: 25, isPublished: true, image: "https://example.com/image10.jpg" },
    ],
    []
  )

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
            {table.getRowModel().rows?.length ? (
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

function RowActions({ row }: { row: EventRow }) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<EventRow | null>(null)

  const update = <K extends keyof EventRow>(key: K, value: EventRow[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))

  return (
    <div className="flex justify-end">
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2 border-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setForm(row)
                setEditOpen(true)
              }}
            >
              Éditer
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem>Supprimer</DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'évènement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'évènement {row.id} ? Cette action est
              définitive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                console.log("Confirm delete", row.id)
              }}
            >
              Supprimer
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
          }
        }}
      >
        <SheetContent side="right" className="sm:max-w-[400px] pt-2">
          <SheetHeader>
            <SheetTitle>Mettre à jour l'évènement</SheetTitle>
            <SheetDescription>
              Modifiez les informations de l'évènement. Cliquez sur "Enregistrer les modifications" quand vous avez terminé.
            </SheetDescription>
          </SheetHeader>

          {form && (
            <form
              className="mt-4 px-4 grid gap-6 overflow-y-auto max-h-[calc(100vh-200px)]"
              onSubmit={(e) => {
                e.preventDefault()
                console.log("Save changes", form)
                setEditOpen(false)
              }}
            >
              <div className="grid gap-3">
                <Label htmlFor="nom">Titre</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => update("nom", e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="payant">Payant</Label>
                <Select
                  value={form.payant}
                  onValueChange={(v: "oui" | "non") => update("payant", v)}
                >
                  <SelectTrigger id="payant">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oui">Oui</SelectItem>
                    <SelectItem value="non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="organisateur">Organisateur</Label>
                <Input
                  id="organisateur"
                  value={form.organisateur}
                  onChange={(e) => update("organisateur", e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label>Dates</Label>
                {form.isMultiDay ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={form.startDate ?? ""}
                      onChange={(e) => update("startDate", e.target.value)}
                    />
                    <Input
                      type="date"
                      value={form.endDate ?? ""}
                      onChange={(e) => update("endDate", e.target.value)}
                    />
                  </div>
                ) : (
                  <Input
                    type="date"
                    value={form.date ?? ""}
                    onChange={(e) => update("date", e.target.value)}
                  />
                )}
              </div>

              <div className="grid gap-3">
                <Label>Horaires</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="startTime" className="text-sm">Début</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={form.startTime ?? ""}
                      onChange={(e) => update("startTime", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="endTime" className="text-sm">Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={form.endTime ?? ""}
                      onChange={(e) => update("endTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="places">Places</Label>
                <Input
                  id="places"
                  type="number"
                  min={0}
                  value={form.places}
                  onChange={(e) => update("places", Number(e.target.value))}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="image">Image de l'événement</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        update("image", reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={form.image || "/placeholder.svg"} 
                      alt="Aperçu" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label htmlFor="isPublished" className="flex flex-col gap-1">
                  <span className="font-medium text-sm">État de publication</span>
                  <span className="text-xs text-muted-foreground">
                    {form.isPublished ? "Événement publié" : "Événement en brouillon"}
                  </span>
                </Label>
                <Switch
                  id="isPublished"
                  checked={form.isPublished}
                  onCheckedChange={(checked) => update("isPublished", checked)}
                />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditOpen(false)}
                  className="w-full"
                >
                  Fermer
                </Button>
                <Button type="submit" className="w-full">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
