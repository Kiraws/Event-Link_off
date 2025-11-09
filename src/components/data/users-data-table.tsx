
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
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
import { Switch } from "../ui/switch"

type UserRow = {
  id: string
  nomComplet: string
  discipline: string
  email: string
  role: "admin" | "user"
}

export default function UsersDataTable() {
  const initialData = React.useMemo<UserRow[]>(
    () => [
      { id: "USR-001", nomComplet: "Jean Dupont", discipline: "Football", email: "jean.dupont@example.com",role: "user" },
      { id: "USR-002", nomComplet: "Marie Curie", discipline: "Tennis", email: "marie.curie@example.com",role: "user" },
      { id: "USR-003", nomComplet: "Ali Ben", discipline: "Basketball", email: "ali.ben@example.com",role: "user" },
      { id: "USR-004", nomComplet: "Chloé Martin", discipline: "Natation", email: "chloe.martin@example.com",role: "user" },
      { id: "USR-005", nomComplet: "Lucas Moreau", discipline: "Cyclisme", email: "lucas.moreau@example.com",role: "user" },
      { id: "USR-001", nomComplet: "Jean Dupont", discipline: "Football", email: "jean.dupont@example.com", role: "user" },
      { id: "USR-002", nomComplet: "Marie Curie", discipline: "Tennis", email: "marie.curie@example.com", role: "admin" },
      { id: "USR-003", nomComplet: "Ali Ben", discipline: "Basketball", email: "ali.ben@example.com", role: "user" },
      { id: "USR-004", nomComplet: "Chloé Martin", discipline: "Natation", email: "chloe.martin@example.com", role: "user" },
      { id: "USR-005", nomComplet: "Lucas Moreau", discipline: "Cyclisme", email: "lucas.moreau@example.com", role: "admin" },
    ],
    []
  )

  const [rows, setRows] = React.useState<UserRow[]>(initialData)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<UserRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
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
      accessorKey: "nomComplet",
      header: ({ column }) => (
        <Button variant="ghost" className="px-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nom complet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("nomComplet")}</span>,
    },
    {
      accessorKey: "discipline",
      header: "Discipline sportive",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button variant="ghost" className="px-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Rôle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      // Display-only badge in table
      cell: ({ row }) => {
        const v = row.getValue<"admin" | "user">("role")
        const label = v === "admin" ? "Admin" : "Utilisateur"
        const cls = v === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
        return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>
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
        {/* Change filter to target "role" */}
        <Input
          placeholder="Filtrer par rôle… (admin ou user)"
          value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("role")?.setFilterValue(event.target.value)}
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
                  Aucun utilisateur.
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

// Edit sheet keeps role Select for modification
function RowActions({
  row,
  onDelete,
  onSave,
}: {
  row: UserRow
  onDelete: (id: string) => void
  onSave: (updated: UserRow) => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<UserRow | null>(null)

  const update = <K extends keyof UserRow>(key: K, value: UserRow[K]) =>
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
            <DialogTitle>Supprimer l’utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l’utilisateur {row.nomComplet} ? Cette action est définitive.
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

      {/* Edit Sheet with role Select */}
      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setForm(null)
        }}
      >
        <SheetContent side="right" className="sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Mettre à jour l’utilisateur</SheetTitle>
            <SheetDescription>Modifiez les informations puis cliquez sur “Save changes”.</SheetDescription>
          </SheetHeader>

          {form && (
            <form
              className="mt-4 grid gap-6 px-6 "
              onSubmit={(e) => {
                e.preventDefault()
                onSave(form)
                setEditOpen(false)
              }}
            >
              <div className="grid gap-3">
                <Label htmlFor="nomComplet">Nom complet</Label>
                <Input id="nomComplet" value={form.nomComplet} onChange={(e) => update("nomComplet", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="discipline">Discipline sportive</Label>
                <Input id="discipline" value={form.discipline} onChange={(e) => update("discipline", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="role">Rôle</Label>
                <Select value={form.role} onValueChange={(v: "admin" | "user") => update("role", v)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Label htmlFor="suspension">Suspendre</Label>
                <Switch id="suspension" />
              </div>

              <div className="flex flex-col gap-2 space-y-2">
                <Button variant="outline" type="button" className="w-full" onClick={() => setEditOpen(false)}>
                  Fermer
                </Button>
                <Button type="submit" className="w-full">
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}