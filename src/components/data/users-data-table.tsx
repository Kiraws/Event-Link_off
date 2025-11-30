
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
import { ArrowUpDown, MoreHorizontal, Settings2, Loader2, Image as ImageIcon } from "lucide-react"
import { usersService, type User as ApiUser } from "../../../api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
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

type UserRow = {
  id: string
  nomComplet: string
  email: string
  phone?: string
  role: "admin" | "user" | "moderator" | "organizer"
  status?: "ACTIVE" | "DISABLED" | "INACTIVE"
  profile_picture_url?: string
}

export default function UsersDataTable() {
  const [users, setUsers] = React.useState<ApiUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Charger les utilisateurs
  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const usersResponse = await usersService.getAll()
      setUsers(usersResponse.data || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      setError(err.message || "Erreur lors du chargement des utilisateurs")
      toast.error("Impossible de charger les utilisateurs")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Mapper les utilisateurs de l'API vers UserRow
  const data = React.useMemo<UserRow[]>(() => {
    return users.map((user) => {
      // Convertir le rôle de l'API vers le format du tableau
      let role: "admin" | "user" | "moderator" | "organizer" = "user"
      if (user.role === "ADMIN") role = "admin"
      else if (user.role === "MODERATOR") role = "moderator"
      else if (user.role === "ORGANIZER") role = "organizer"
      else role = "user"

      return {
        id: user.uid,
        nomComplet: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sans nom',
        email: user.email,
        phone: user.phone,
        role,
        status: user.status || 'ACTIVE',
        profile_picture_url: user.profile_picture_url,
      }
    })
  }, [users])

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
      accessorKey: "profile_picture_url",
      header: "Photo",
      cell: ({ row }) => {
        const imageUrl = row.original.profile_picture_url
        const nomComplet = row.original.nomComplet
        const initials = nomComplet
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U'

        return (
          <Avatar className="h-10 w-10">
            {imageUrl && imageUrl.startsWith('http') ? (
              <AvatarImage src={imageUrl} alt={nomComplet} />
            ) : null}
            <AvatarFallback>
              {initials || <ImageIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">USR-{row.getValue("id")}</span>,
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
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("phone") || "-"}</span>,
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
        const v = row.getValue<"admin" | "user" | "moderator" | "organizer">("role")
        let label = "Utilisateur"
        let cls = "bg-gray-100 text-gray-700"
        if (v === "admin") {
          label = "Admin"
          cls = "bg-blue-100 text-blue-700"
        } else if (v === "moderator") {
          label = "Modérateur"
          cls = "bg-purple-100 text-purple-700"
        } else if (v === "organizer") {
          label = "Organisateur"
          cls = "bg-green-100 text-green-700"
        }
        return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue<"ACTIVE" | "DISABLED" | "INACTIVE" | undefined>("status") || "ACTIVE"
        let label = "Actif"
        let cls = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        if (status === "DISABLED") {
          label = "Désactivé"
          cls = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
        } else if (status === "INACTIVE") {
          label = "Inactif"
          cls = "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
            {label}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onRefresh={loadUsers}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  const table = useReactTable({
    data,
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
          placeholder="Filtrer les utilisateurs…"
          value={(table.getColumn("nomComplet")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nomComplet")?.setFilterValue(event.target.value)}
          className="max-w-sm"
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
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <span>Chargement des utilisateurs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadUsers}>
                      Réessayer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
  onRefresh,
}: {
  row: UserRow
  onRefresh?: () => void
}) {
  const { user: currentUser } = useAuth()
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<UserRow | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const isCurrentUser = currentUser?.uid === row.id

  React.useEffect(() => {
    if (editOpen && row) {
      setForm({ ...row })
    } else if (!editOpen) {
      setForm(null)
    }
  }, [editOpen, row])

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
          <DropdownMenuContent align="end" className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
            <DropdownMenuLabel className="text-gray-900 dark:text-gray-900">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setForm({ ...row })
                setEditOpen(true)
              }}
              className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100"
            >
              Éditer
            </DropdownMenuItem>
            {row.status === 'DISABLED' || row.status === 'INACTIVE' ? (
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    setDeleting(true)
                    await usersService.enable(row.id)
                    toast.success("Compte utilisateur réactivé avec succès")
                    onRefresh?.()
                  } catch (err: any) {
                    if (err.message?.includes("déjà actif")) {
                      toast.error("Le compte est déjà actif")
                    } else {
                      toast.error(err.message || "Erreur lors de la réactivation")
                    }
                  } finally {
                    setDeleting(false)
                  }
                }}
                className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100"
                disabled={deleting}
              >
                Réactiver
              </DropdownMenuItem>
            ) : (
              <DialogTrigger asChild>
                <DropdownMenuItem className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100">Désactiver</DropdownMenuItem>
              </DialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{row.status === 'DISABLED' || row.status === 'INACTIVE' ? 'Réactiver' : 'Désactiver'} l'utilisateur</DialogTitle>
            <DialogDescription>
              {isCurrentUser ? (
                <>
                  Vous ne pouvez pas désactiver votre propre compte.
                  <br />
                  <br />
                  <strong>Note:</strong> Pour désactiver votre compte, veuillez contacter un administrateur.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir désactiver l'utilisateur "{row.nomComplet}" ?
                  <br />
                  <br />
                  <strong>Note:</strong> Le compte sera désactivé (status = 'DISABLED'). L'utilisateur ne pourra plus se connecter et recevra un message pour contacter le service client. Le compte n'est pas supprimé définitivement.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (isCurrentUser) {
                  toast.error("Vous ne pouvez pas désactiver votre propre compte")
                  return
                }
                try {
                  setDeleting(true)
                  await usersService.disable(row.id)
                  toast.success("Compte utilisateur désactivé avec succès")
                  onRefresh?.()
                } catch (err: any) {
                  if (err.message?.includes("propre compte")) {
                    toast.error("Vous ne pouvez pas désactiver votre propre compte")
                  } else if (err.message?.includes("déjà désactivé")) {
                    toast.error("Le compte est déjà désactivé")
                  } else {
                    toast.error(err.message || "Erreur lors de la désactivation")
                  }
                } finally {
                  setDeleting(false)
                }
              }}
              disabled={deleting || isCurrentUser}
            >
              {deleting ? "Désactivation..." : "Désactiver"}
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
              onSubmit={async (e) => {
                e.preventDefault()
                if (!form) return

                try {
                  setSaving(true)
                  
                  // Séparer le nom complet en first_name et last_name
                  const nameParts = form.nomComplet.trim().split(' ')
                  const first_name = nameParts[0] || ''
                  const last_name = nameParts.slice(1).join(' ') || ''

                  // Convertir le rôle vers le format API
                  let apiRole: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER' = 'USER'
                  if (form.role === 'admin') apiRole = 'ADMIN'
                  else if (form.role === 'moderator') apiRole = 'MODERATOR'
                  else if (form.role === 'organizer') apiRole = 'ORGANIZER'
                  else apiRole = 'USER'

                  await usersService.update(row.id, {
                    first_name,
                    last_name,
                    phone: form.phone,
                    role: apiRole,
                  })

                  toast.success("Utilisateur mis à jour avec succès")
                  setEditOpen(false)
                  onRefresh?.()
                } catch (err: any) {
                  toast.error(err.message || "Erreur lors de la mise à jour")
                } finally {
                  setSaving(false)
                }
              }}
            >
              <div className="grid gap-3">
                <Label htmlFor="nomComplet">Nom complet</Label>
                <Input id="nomComplet" value={form.nomComplet} onChange={(e) => update("nomComplet", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" value={form.phone || ''} onChange={(e) => update("phone", e.target.value)} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="role">Rôle</Label>
                <Select value={form.role} onValueChange={(v: "admin" | "user" | "moderator" | "organizer") => update("role", v)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="moderator">Modérateur</SelectItem>
                    <SelectItem value="organizer">Organisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 space-y-2">
                <Button variant="outline" type="button" className="w-full" onClick={() => setEditOpen(false)}>
                  Fermer
                </Button>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Enregistrement..." : "Sauvegarder les modifications"}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}