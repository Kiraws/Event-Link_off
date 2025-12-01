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
import { ArrowUpDown, Settings2, Loader2, CheckCircle2, MessageSquare, Eye } from "lucide-react"
import { contactService, type ContactMessage } from "../../../api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type ContactRow = {
  uid: string
  name: string
  email: string
  message: string
  status: "PENDING" | "READ" | "REPLIED"
  read_at: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-"
  try {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En attente</Badge>
    case "READ":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Lu</Badge>
    case "REPLIED":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Répondu</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ContactDataTable() {
  const [messages, setMessages] = React.useState<ContactMessage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // État pour les dialogues
  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessage | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = React.useState(false)
  const [replyMessage, setReplyMessage] = React.useState("")
  const [replying, setReplying] = React.useState(false)

  // Charger les messages
  const loadMessages = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: any = { page, limit }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      const response = await contactService.getAll(params)
      
      if (response.data && Array.isArray(response.data)) {
        setMessages(response.data)
      }
      
      if (response.pagination) {
        setTotal(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des messages:', err)
      setError(err.message || "Erreur lors du chargement des messages")
      toast.error("Impossible de charger les messages")
    } finally {
      setLoading(false)
    }
  }, [page, limit, statusFilter])

  React.useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleMarkAsRead = async (uid: string) => {
    try {
      await contactService.markAsRead(uid)
      toast.success("Message marqué comme lu")
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du marquage")
    }
  }

  const handleViewMessage = async (messageUid: string) => {
    const message = messages.find(m => m.uid === messageUid)
    if (!message) return
    
    setSelectedMessage(message)
    setViewDialogOpen(true)
    // Marquer comme lu si ce n'est pas déjà fait
    if (message.status === "PENDING") {
      await handleMarkAsRead(message.uid)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast.error("Veuillez saisir un message de réponse")
      return
    }

    try {
      setReplying(true)
      await contactService.reply(selectedMessage.uid, {
        reply_message: replyMessage.trim(),
      })
      toast.success("Réponse envoyée avec succès")
      setReplyDialogOpen(false)
      setReplyMessage("")
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi de la réponse")
    } finally {
      setReplying(false)
    }
  }

  const data: ContactRow[] = React.useMemo(() => {
    return messages.map((msg) => ({
      uid: msg.uid,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      status: msg.status,
      read_at: msg.read_at,
      replied_at: msg.replied_at,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
    }))
  }, [messages])

  const columns: ColumnDef<ContactRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
    },
    {
      accessorKey: "name",
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
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message") as string
        return (
          <span className="text-sm text-muted-foreground max-w-xs truncate block">
            {message}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const message = row.original
        return (
          <div className="flex justify-end gap-2">
            <Dialog open={viewDialogOpen && selectedMessage?.uid === message.uid} onOpenChange={setViewDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewMessage(message.uid)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Message de {message.name}</DialogTitle>
                  <DialogDescription>
                    Reçu le {formatDate(message.created_at)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium">{message.email}</p>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <div className="mt-1">{getStatusBadge(message.status)}</div>
                  </div>
                  <div>
                    <Label>Message</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {message.message}
                    </div>
                  </div>
                  {message.read_at && (
                    <div>
                      <Label>Lu le</Label>
                      <p className="text-sm text-muted-foreground">{formatDate(message.read_at)}</p>
                    </div>
                  )}
                  {message.replied_at && (
                    <div>
                      <Label>Répondu le</Label>
                      <p className="text-sm text-muted-foreground">{formatDate(message.replied_at)}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Fermer
                  </Button>
                  {message.status !== "REPLIED" && (
                    <Button
                      onClick={() => {
                        const fullMessage = messages.find(m => m.uid === message.uid)
                        if (fullMessage) {
                          setViewDialogOpen(false)
                          setSelectedMessage(fullMessage)
                          setTimeout(() => setReplyDialogOpen(true), 100)
                        }
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Répondre
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={replyDialogOpen && selectedMessage?.uid === message.uid} onOpenChange={setReplyDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Répondre à {message.name}</DialogTitle>
                  <DialogDescription>
                    Votre réponse sera envoyée par email à {message.email}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reply-message">Message de réponse</Label>
                    <Textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Tapez votre réponse ici..."
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplyDialogOpen(false)
                      setReplyMessage("")
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleReply}
                    disabled={replying || !replyMessage.trim()}
                  >
                    {replying ? "Envoi..." : "Envoyer la réponse"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {message.status === "PENDING" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(message.uid)}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

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
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-4">
        <Input
          placeholder="Filtrer par nom ou email…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="READ">Lus</SelectItem>
            <SelectItem value="REPLIED">Répondus</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 />
              Colonnes
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
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
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
                    <span>Chargement des messages...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadMessages}>
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
                  Aucun message trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {total} message(s) au total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Précédent
          </Button>
          <div className="text-sm">
            Page {page} sur {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || loading}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

