
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

type CategoryRow = {
  id: string
  libelle: string
  description: string
  actif: "oui" | "non"
}

export default function CategoryDataTable() {
  const initialData = React.useMemo<CategoryRow[]>(
    () => [
      { id: "CAT-001", libelle: "Football", description: "Catégorie pour le football", actif: "oui" },
      { id: "CAT-002", libelle: "Basketball", description: "Catégorie pour le basketball", actif: "oui" },
      { id: "CAT-003", libelle: "Natation", description: "Catégorie aquatique", actif: "non" },
      { id: "CAT-004", libelle: "Cyclisme", description: "Vélo de route et VTT", actif: "oui" },
      { id: "CAT-005", libelle: "Tennis", description: "Catégorie tennis", actif: "non" },
    ],
    []
  )

  const [rows, setRows] = React.useState<CategoryRow[]>(initialData)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<CategoryRow>[] = [
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
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "libelle",
      header: ({ column }) => (
        <Button variant="ghost" className="px-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Libellé
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("libelle")}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "actif",
      header: "Actif",
      cell: ({ row }) => {
        const v = row.getValue<"oui" | "non">("actif")
        const cls = v === "oui" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{v === "oui" ? "Oui" : "Non"}</span>
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onDelete={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
          onSave={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
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
          placeholder="Filtrer par libellé…"
          value={(table.getColumn("libelle")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("libelle")?.setFilterValue(event.target.value)}
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

      {/* DataTable */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucune catégorie.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">{Object.keys(rowSelection).length} row(s) selected.</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function RowActions({
  row,
  onDelete,
  onSave,
}: {
  row: CategoryRow
  onDelete: (id: string) => void
  onSave: (updated: CategoryRow) => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<CategoryRow | null>(null)

  const update = <K extends keyof CategoryRow>(key: K, value: CategoryRow[K]) =>
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
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie {row.id} ? Cette action est définitive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => onDelete(row.id)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setForm(null)
        }}
      >
        <SheetContent side="right" className="sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Mettre à jour la catégorie</SheetTitle>
            <SheetDescription>Modifiez les informations puis cliquez sur “Save changes”.</SheetDescription>
          </SheetHeader>

          {form && (
            <form
              className="mt-4 grid gap-6 px-6"
              onSubmit={(e) => {
                e.preventDefault()
                onSave(form)
                setEditOpen(false)
              }}
            >
              <div className="grid gap-3">
                <Label htmlFor="libelle">Libellé</Label>
                <Input id="libelle" value={form.libelle} onChange={(e) => update("libelle", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label>Actif</Label>
                <RadioGroup
                  value={form.actif}
                  onValueChange={(v) => update("actif", v as "oui" | "non")}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem id="actif-oui" value="oui" />
                    <Label htmlFor="actif-oui">Oui</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem id="actif-non" value="non" />
                    <Label htmlFor="actif-non">Non</Label>
                  </div>
                </RadioGroup>
              </div>


              <div className="flex flex-col gap-2 space-y-2">
                <Button variant="outline" type="button" className="w-full" onClick={() => setEditOpen(false)}>
                  Close
                </Button>
                <Button type="submit" className="w-full">
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}