"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
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
import { ArrowUpDown, MoreHorizontal, Settings2, Image as ImageIcon } from "lucide-react"
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
import { categoriesService, type Category } from "../../../api"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CategoryDataTable() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Charger les catégories depuis l'API
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesService.getAll()
      setCategories(response.data || [])
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des catégories")
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<Category>[] = [
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
        const category = row.original
        const imageUrl = category.slug // Le slug contient l'URL de l'image Cloudinary
        
        return (
          <Avatar className="h-10 w-10">
            {imageUrl && imageUrl.startsWith('http') ? (
              <AvatarImage src={imageUrl} alt={category.name} />
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
      accessorKey: "uid",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
         CAT-{row.getValue("uid")}
        </span>
      ),
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
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue<string>("description")
        return <span className="text-sm text-muted-foreground">{desc || "-"}</span>
      },
    },
    {
      accessorKey: "active",
      header: "Actif",
      cell: ({ row }) => {
        const isActive = row.getValue<boolean>("active")
        const cls = isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}
          >
            {isActive ? "Oui" : "Non"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <RowActions
          category={row.original}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  const handleDelete = async (uid: string) => {
    try {
      await categoriesService.delete(uid)
      toast.success("Catégorie supprimée avec succès")
      loadCategories()
    } catch (error: any) {
      // Gérer l'erreur 409 si la catégorie est encore utilisée
      if (error.error === "CATEGORY_IN_USE" || error.message?.includes("utilisée par des événements")) {
        toast.error("Impossible de supprimer cette catégorie car elle est encore utilisée par des événements. Veuillez d'abord supprimer ou modifier les événements associés.")
      } else {
        toast.error(error.message || "Erreur lors de la suppression")
      }
    }
  }

  const handleUpdate = async (updatedCategory: Category) => {
    try {
      await categoriesService.update(updatedCategory.uid, {
        name: updatedCategory.name,
        slug: updatedCategory.slug, // Contient l'URL de l'image
        description: updatedCategory.description,
        active: updatedCategory.active,
      })
      toast.success("Catégorie mise à jour avec succès")
      loadCategories()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const table = useReactTable({
    data: categories,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Chargement des catégories...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 py-4">
        <Input
          placeholder="Filtrer par nom…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="w-64"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 />
              Voir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
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
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucune catégorie.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

function RowActions({
  category,
  onDelete,
  onUpdate,
}: {
  category: Category
  onDelete: (uid: string) => void
  onUpdate: (category: Category) => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<Category>(category)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    category.slug && category.slug.startsWith('http') ? category.slug : null
  )
  const [uploading, setUploading] = React.useState(false)

  const update = <K extends keyof Category>(
    key: K,
    value: Category[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = form.slug // Garder l'URL actuelle par défaut

      // Upload de la nouvelle image si un fichier a été sélectionné
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile, 'categories')
        toast.success("Image uploadée avec succès")
      }

      // Mettre à jour la catégorie avec la nouvelle URL d'image dans le slug
      await onUpdate({
        ...form,
        slug: imageUrl, // Le slug contient maintenant l'URL Cloudinary
      })

      setEditOpen(false)
      setImageFile(null)
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    } finally {
      setUploading(false)
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setForm(category)
                setImagePreview(category.slug && category.slug.startsWith('http') ? category.slug : null)
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
              Êtes-vous sûr de vouloir supprimer la catégorie "{category.name}" ?
              <br />
              <br />
              <strong>Note:</strong> La catégorie sera marquée comme supprimée (soft delete). Elle ne sera plus visible dans les listes mais restera en base de données.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => onDelete(category.uid)}>
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
            setForm(category)
            setImageFile(null)
            setImagePreview(category.slug && category.slug.startsWith('http') ? category.slug : null)
          }
        }}
      >
        <SheetContent side="right" className="sm:max-w-[420px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Mettre à jour la catégorie</SheetTitle>
            <SheetDescription>
              Modifiez les informations puis cliquez sur "Enregistrer".
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <form
              className="mt-4 grid gap-6 px-6 pb-4"
              onSubmit={handleSubmit}
            >
            <div className="grid gap-3">
              <Label htmlFor="image">Image de la catégorie</Label>
              <div className="space-y-4">
                {/* Zone d'upload stylisée - carrée et réduite */}
                <label
                  htmlFor="image"
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
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  L'URL de l'image sera stockée dans le champ slug
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description || ""}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label>Actif</Label>
              <RadioGroup
                value={form.active ? "oui" : "non"}
                onValueChange={(v) => update("active", v === "oui")}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="active-oui" value="oui" />
                  <Label htmlFor="active-oui">Oui</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="active-non" value="non" />
                  <Label htmlFor="active-non">Non</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2 space-y-2">
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => setEditOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
