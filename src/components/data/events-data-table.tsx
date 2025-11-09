// ... previous implementation removed ...

"use client"

import * as React from "react"
// FIX: type-only imports for TS with verbatimModuleSyntax
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
// FIX: add flexRender and keep value imports separate
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Settings2 } from "lucide-react"
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

// ADD: shadcn Dialog components
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

// ADD: shadcn Sheet components for the Edit action
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

// INSERT: UI helpers to style the Sheet like the example
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

// mock event type
type EventRow = {
  id: string
  nom: string
  isMultiDay: boolean
  date?: string
  startDate?: string
  endDate?: string
  category: string
  payant: "oui" | "non"
  organisateur: string
  places: number
}

// format FR date
const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString("fr-FR") : "")

// table columns
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
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    // REPLACED: inline dropdown actions with a dedicated RowActions component
    cell: ({ row }) => <RowActions row={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
]

export default function EventsDataTable() {
  // Mock data for events (fictitious)
  const data = React.useMemo<EventRow[]>(
    () => [
      { id: "EVT-001", nom: "Conférence Tech 2025", isMultiDay: true, startDate: "2025-03-12", endDate: "2025-03-14", category: "Conférence", payant: "oui", organisateur: "TechCorp", places: 250},
      { id: "EVT-002", nom: "Atelier Design", isMultiDay: false, date: "2025-04-05", category: "Atelier", payant: "non", organisateur: "Design Hub", places: 40},
      { id: "EVT-003", nom: "Meetup JS", isMultiDay: false, date: "2025-05-02", category: "Meetup", payant: "non", organisateur: "Dev Community", places: 120},
      { id: "EVT-004", nom: "Salon Entreprises", isMultiDay: true, startDate: "2025-06-20", endDate: "2025-06-22", category: "Salon", payant: "oui", organisateur: "Business Expo", places: 500},
      { id: "EVT-005", nom: "Hackathon AI", isMultiDay: true, startDate: "2025-07-10", endDate: "2025-07-12", category: "Hackathon", payant: "non", organisateur: "AI Labs", places: 100},
      { id: "EVT-006", nom: "Forum Étudiants", isMultiDay: false, date: "2025-08-28", category: "Forum", payant: "non", organisateur: "Université Centrale", places: 300 },
      { id: "EVT-007", nom: "Webinar Sécurité", isMultiDay: false, date: "2025-09-09", category: "Webinar", payant: "oui", organisateur: "SecOps", places: 1000},
      { id: "EVT-008", nom: "Concert d’été", isMultiDay: false, date: "2025-07-30", category: "Concert", payant: "oui", organisateur: "City Events", places: 800 },
      { id: "EVT-009", nom: "Séminaire RH", isMultiDay: true, startDate: "2025-10-03", endDate: "2025-10-04", category: "Séminaire", payant: "oui", organisateur: "PeopleFirst", places: 60},
      { id: "EVT-010", nom: "Formation Node.js", isMultiDay: false, date: "2025-11-15", category: "Formation", payant: "non", organisateur: "CodeSchool", places: 25},
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
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 py-4">
        <Input
          placeholder="Filtrer par nom…"
          value={(table.getColumn("nom")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nom")?.setFilterValue(event.target.value)}
          className="w-64"
        />

        {/* Column visibility + actions */}
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

      {/* DataTable */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {/* FIX: use flexRender to provide proper HeaderContext */}
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
                      {/* FIX: use flexRender for cells (removes any and type errors) */}
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

      {/* Footer: selection + pagination */}
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

// INSERT: RowActions component (uses shadcn Dialog + Sheet)
function RowActions({ row }: { row: EventRow }) {
  // local state to handle Edit sheet
  const [editOpen, setEditOpen] = React.useState(false)

  // NEW: controlled form state mirroring your fields
  const [form, setForm] = React.useState<EventRow | null>(null)

  // helper to update form fields
  const update = <K extends keyof EventRow>(key: K, value: EventRow[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))

  return (
    <div className="flex justify-end">
      {/* Actions dropdown */}
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

            {/* EDIT: open the Sheet with selected row */}
            <DropdownMenuItem
              onClick={() => {
                // REMOVED: setSelected(row)
                setForm(row) // initialize form with current row data
                setEditOpen(true)
              }}
            >
              Éditer
            </DropdownMenuItem>

            {/* DELETE: open confirmation dialog */}
            <DialogTrigger asChild>
              <DropdownMenuItem>Supprimer</DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Confirmation Dialog */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l’évènement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l’évènement {row.id} ? Cette action est
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
                // TODO: wire to delete API
                console.log("Confirm delete", row.id)
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet styled like the example while keeping your fields */}
      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            // REMOVED: setSelected(null)
            setForm(null)
          }
        }}
      >
        <SheetContent side="right" className="sm:max-w-[400px] pt-2">
          <SheetHeader>
            <SheetTitle>Mettre à jour l’évènement</SheetTitle>
            <SheetDescription>
              Modifiez les informations de l’évènement. Cliquez sur “Save changes” quand vous avez terminé.
            </SheetDescription>
          </SheetHeader>

          {form && (
            <form
              className="mt-4 px-4 grid gap-6 overflow-y-scroll"
              onSubmit={(e) => {
                e.preventDefault()
                // TODO: persist form with your API
                console.log("Save changes", form)
                setEditOpen(false)
              }}
            >
              {/* Title-like field (Nom) */}
              <div className="grid gap-3">
                <Label htmlFor="nom">Titre</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => update("nom", e.target.value)}
                />
              </div>

              {/* Status-like field using Select for Payant */}
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

              {/* Label-like group (Category) */}
              <div className="grid gap-3">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                />
              </div>

              {/* Priority-like radio group mapped to Organisateur type? Keep your field: Organisateur text */}
              <div className="grid gap-3">
                <Label htmlFor="organisateur">Organisateur</Label>
                <Input
                  id="organisateur"
                  value={form.organisateur}
                  onChange={(e) => update("organisateur", e.target.value)}
                />
              </div>

              {/* Dates section */}
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

              {/* Places number input */}
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
              <div className="flex items-center gap-2 ">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-1/2"
                >
                Publier
                </Button>
                <Button type="submit" className="w-1/2">
                 Dépublier
                </Button>
              </div>

              {/* Footer buttons styled like the example */}
              <div className="flex flex-col items-center gap-2 space-y-2 ">
                <Button 
                  variant="outline" 
                  type="button" 
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