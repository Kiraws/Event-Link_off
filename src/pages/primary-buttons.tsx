import { Download, Plus, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { categoriesService, eventsService, authService, usersService, type Category } from "../../api"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { MapLocationPicker } from "@/components/MapLocationPicker"

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'


export function PrimaryButtons() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isEvents = location.pathname === ('/dashboard/events')
  const isEventsCategory = location.pathname.startsWith('/dashboard/events_category')
 const isUsers = location.pathname === ('/dashboard/users')

  const handleAddClick = () => {
    if (isEvents || isEventsCategory || isUsers) setOpen(true)
  }

  // Submit handlers
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingEvent(true)

    try {
      let imageUrl = ''

      // Upload de l'image si elle existe
      if (eventForm.image) {
        imageUrl = await uploadImageToCloudinary(eventForm.image, 'events')
        toast.success("Image uploadée avec succès")
      }

      // Construire les dates au format ISO
      let start_date: string
      let end_date: string

      if (eventForm.isMultiDay) {
        const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || '00:00'}:00`)
        const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime || '23:59'}:59`)
        start_date = startDateTime.toISOString()
        end_date = endDateTime.toISOString()
      } else {
        const startDateTime = new Date(`${eventForm.date}T${eventForm.startTime || '00:00'}:00`)
        const endDateTime = new Date(`${eventForm.date}T${eventForm.endTime || '23:59'}:59`)
        start_date = startDateTime.toISOString()
        end_date = endDateTime.toISOString()
      }

      // Créer l'événement via l'API
      await eventsService.create({
        title: eventForm.nom,
        description: eventForm.description || '',
        start_date,
        end_date,
        location: eventForm.location || '',
        is_free: eventForm.payant === 'non',
        is_multi_day: eventForm.isMultiDay,
        status: eventForm.status,
        image_url: imageUrl || undefined,
        organizer: eventForm.organisateur || undefined,
        max_capacity: eventForm.places ? parseInt(eventForm.places) : undefined,
        category_uid: eventForm.category_uid || undefined,
        latitude: eventForm.hasCoordinates && eventForm.latitude ? parseFloat(eventForm.latitude) : undefined,
        longitude: eventForm.hasCoordinates && eventForm.longitude ? parseFloat(eventForm.longitude) : undefined,
      })

      toast.success("Événement créé avec succès")
      setOpen(false)
      
      // Réinitialiser le formulaire
      setEventForm({
        nom: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: '',
        isMultiDay: false,
        category_uid: '',
        payant: 'non',
        organisateur: '',
        location: '',
        hasCoordinates: false,
        latitude: '',
        longitude: '',
        places: '',
        status: 'draft',
        image: null,
      })
      setEventImagePreview(null)
      
      // Recharger la page pour voir le nouvel événement
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de l'événement")
    } finally {
      setUploadingEvent(false)
    }
  }

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingCategory(true)

    try {
      let imageUrl = ''

      // Upload de l'image si elle existe
      if (categoryForm.image) {
        imageUrl = await uploadImageToCloudinary(categoryForm.image, 'categories')
        toast.success("Image uploadée avec succès")
      }

      // Générer un slug basé sur le libellé (pour le slug, on utilisera l'URL de l'image)
      const slug = imageUrl || categoryForm.libelle.toLowerCase().replace(/\s+/g, '-')

      // Créer la catégorie via l'API
      await categoriesService.create({
        name: categoryForm.libelle,
        slug: slug, // Le slug contient l'URL Cloudinary de l'image
        description: categoryForm.description || undefined,
        active: categoryForm.active === 'oui',
      })

      toast.success("Catégorie créée avec succès")
      setOpen(false)
      // Réinitialiser le formulaire
      setCategoryForm({
        libelle: '',
        description: '',
        active: 'oui',
        image: null,
      })
      setCategoryImagePreview(null)
      
      // Recharger la page pour voir la nouvelle catégorie
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la catégorie")
    } finally {
      setUploadingCategory(false)
    }
  }

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCategoryForm(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEventForm(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setEventImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove ID and add single/multi-day date handling
  const [eventForm, setEventForm] = useState({
    nom: '',
    description: '',
    // single day
    date: '',
    startTime: '',
    endTime: '', // Heure de fin (utilisée pour un jour et plusieurs jours)
    // multi day
    startDate: '',
    endDate: '',
    isMultiDay: false,
    category_uid: '',
    payant: 'non' as 'oui' | 'non',
    organisateur: '',
    location: '',
    hasCoordinates: false,
    latitude: '',
    longitude: '',
    places: '',
    status: 'draft' as 'draft' | 'published' | 'cancelled',
    image: null as File | null,
  })
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null)
  const [uploadingEvent, setUploadingEvent] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Charger les catégories actives
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.getAll()
        const allCategories = response?.data || []
        // Filtrer les catégories actives côté client
        const activeCategories = allCategories.filter((cat: Category) => cat.active === true)
        setCategories(activeCategories.length > 0 ? activeCategories : allCategories)
        if (allCategories.length === 0) {
          toast.warning("Aucune catégorie disponible")
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des catégories:', error)
        toast.error(error?.message || "Erreur lors du chargement des catégories")
      }
    }
    loadCategories()
  }, [])
  const [categoryForm, setCategoryForm] = useState({
    libelle: '',
    description: '',
    active: 'oui' as 'oui' | 'non',
    image: null as File | null,
  })
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null)
  const [uploadingCategory, setUploadingCategory] = useState(false)

  // Formulaire utilisateur
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER',
  })
  const [uploadingUser, setUploadingUser] = useState(false)

  // Handler pour créer un utilisateur
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingUser(true)

    try {
      // Créer l'utilisateur via l'API d'inscription (crée toujours avec le rôle USER)
      const registerResponse = await authService.register({
        email: userForm.email,
        password: userForm.password,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        phone: userForm.phone || undefined,
      })

      // Si un rôle différent de USER est sélectionné, mettre à jour le rôle
      if (userForm.role !== 'USER' && registerResponse.data?.user?.uid) {
        try {
          await usersService.update(registerResponse.data.user.uid, {
            role: userForm.role,
          })
          toast.success(`Utilisateur créé avec succès avec le rôle ${userForm.role}`)
        } catch (updateError: any) {
          // Si la mise à jour du rôle échoue, l'utilisateur est quand même créé avec le rôle USER
          console.error('Erreur lors de la mise à jour du rôle:', updateError)
          toast.warning("Utilisateur créé mais impossible de définir le rôle. L'utilisateur a le rôle USER par défaut.")
        }
      } else {
        toast.success("Utilisateur créé avec succès")
      }

      setOpen(false)
      
      // Réinitialiser le formulaire
      setUserForm({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'USER',
      })
      
      // Recharger la page pour voir le nouvel utilisateur
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de l'utilisateur")
    } finally {
      setUploadingUser(false)
    }
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
      >
        <span>Exporter</span> <Download size={18} />
      </Button>
    
    <Button className='space-x-1' onClick={handleAddClick}>
      <span>Ajouter</span> <Plus size={18} />
    </Button>

      {/* add padding to the sheet to avoid fields touching edges */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className={`p-4 sm:p-6 flex flex-col overflow-hidden ${isEvents ? 'sm:max-w-2xl' : ''}`}>
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>
              {isEvents
                ? 'Ajouter un évènement'
                : isEventsCategory
                ? "Ajouter une catégorie d'évènements"
                : isUsers
                ? "Ajouter un utilisateur"
                : 'Ajouter'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto pr-2">
          {isEvents && (
            <div>
              {/* Place your event creation form component here */}
              {/* Inline form for event creation */}
              <form className='space-y-4' onSubmit={handleSubmitEvent}>
                {/* Group fields and add separators for spacing */}
                <FieldGroup className='grid grid-cols-1 gap-4'>
                  {/* Upload d'image en haut */}
                  <Field>
                    <FieldLabel>Image de l'événement</FieldLabel>
                    <div className="space-y-4">
                      {/* Zone d'upload stylisée - carrée et réduite */}
                      <label
                        htmlFor="event-image"
                        className="relative flex flex-col items-center justify-center w-full aspect-square max-w-xs mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {eventImagePreview ? (
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <img
                              src={eventImagePreview}
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
                          id="event-image"
                          type="file"
                          accept="image/*"
                          onChange={handleEventImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <FieldDescription>
                      L'image sera stockée dans Cloudinary
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Nom</FieldLabel>
                    <Input
                      type='text'
                      value={eventForm.nom}
                      onChange={e => setEventForm(prev => ({ ...prev, nom: e.target.value }))}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={eventForm.description}
                      onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder='Décrivez l événement'
                      className='min-h-24'
                    />
                  </Field>

                  {/* Durée: un jour vs plusieurs jours */}
                  <Field>
                    <FieldLabel>Durée</FieldLabel>
                    {/* REPLACED native inputs with RadioGroup */}
                    <RadioGroup
                      value={eventForm.isMultiDay ? 'multi' : 'single'}
                      onValueChange={(val) =>
                        setEventForm(prev => ({
                          ...prev,
                          isMultiDay: val === 'multi',
                          // clear opposite date fields to avoid conflicting data
                          date: val === 'single' ? prev.date : '',
                          startDate: val === 'multi' ? prev.startDate : '',
                          endDate: val === 'multi' ? prev.endDate : '',
                        }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="duree-single" />
                        <Label htmlFor="duree-single">Un jour</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multi" id="duree-multi" />
                        <Label htmlFor="duree-multi">Plusieurs jours</Label>
                      </div>
                    </RadioGroup>
                    <FieldDescription>
                      Choisissez “Un jour” pour une seule date, “Plusieurs jours” pour début/fin.
                    </FieldDescription>
                  </Field>

                  {/* Date fields based on Durée */}
                  {!eventForm.isMultiDay && (
                    <FieldGroup className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                      <Field>
                        <FieldLabel>Date</FieldLabel>
                        <Input
                          type='date'
                          value={eventForm.date}
                          onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Heure de début</FieldLabel>
                        <Input
                          type='time'
                          value={eventForm.startTime}
                          onChange={e => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Heure de fin</FieldLabel>
                        <Input
                          type='time'
                          value={eventForm.endTime}
                          onChange={e => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                          min={eventForm.startTime || undefined}
                          required
                        />
                      </Field>
                    </FieldGroup>
                  )}

                  {eventForm.isMultiDay && (
                    <FieldGroup className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <Field>
                        <FieldLabel>Date de début</FieldLabel>
                        <Input
                          type='date'
                          value={eventForm.startDate}
                          onChange={e => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Heure de début</FieldLabel>
                        <Input
                          type='time'
                          value={eventForm.startTime}
                          onChange={e => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Date de fin</FieldLabel>
                        <Input
                          type='date'
                          value={eventForm.endDate}
                          min={eventForm.startDate || undefined}
                          onChange={e => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Heure de fin</FieldLabel>
                        <Input
                          type='time'
                          value={eventForm.endTime}
                          onChange={e => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                          required
                        />
                      </Field>
                    </FieldGroup>
                  )}

                  <FieldSeparator />

                  {/* Location avec carte OpenStreetMap */}
                  <Field>
                    <FieldLabel>Lieu</FieldLabel>
                    <MapLocationPicker
                      location={eventForm.location}
                      latitude={eventForm.latitude}
                      longitude={eventForm.longitude}
                      onLocationChange={(location) => {
                        setEventForm(prev => ({ ...prev, location, hasCoordinates: true }))
                      }}
                      onCoordinatesChange={(lat, lng) => {
                        setEventForm(prev => ({ ...prev, latitude: lat, longitude: lng, hasCoordinates: true }))
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
                      value={eventForm.category_uid || undefined}
                      onValueChange={(value) => setEventForm(prev => ({ ...prev, category_uid: value }))}
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
                      value={eventForm.payant}
                      onValueChange={(val) =>
                        setEventForm(prev => ({ ...prev, payant: val as 'oui' | 'non' }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oui" id="payant-oui" />
                        <Label htmlFor="payant-oui">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non" id="payant-non" />
                        <Label htmlFor="payant-non">Non</Label>
                      </div>
                    </RadioGroup>
                  </Field>

                  <Field>
                    <FieldLabel>Nom d’organisateur</FieldLabel>
                    <Input
                      type='text'
                      value={eventForm.organisateur}
                      onChange={e => setEventForm(prev => ({ ...prev, organisateur: e.target.value }))}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Nombre de places</FieldLabel>
                    <Input
                      type='number'
                      min={0}
                      value={eventForm.places}
                      onChange={e => setEventForm(prev => ({ ...prev, places: e.target.value }))}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Statut</FieldLabel>
                    <Select
                      value={eventForm.status}
                      onValueChange={(value) => setEventForm(prev => ({ ...prev, status: value as 'draft' | 'published' | 'cancelled' }))}
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
                  <Button variant='outline' type='button' onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type='submit' disabled={uploadingEvent}>
                    {uploadingEvent ? 'Création...' : "Enregistrer l'évènement"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isEventsCategory && (
            <div>
              {/* Place your event category creation form component here */}
              {/* Inline form for category creation */}
              <form className='mt-4 space-y-6' onSubmit={handleSubmitCategory}>
                <FieldGroup className='grid grid-cols-1 gap-4'>
                  <Field>
                    <FieldLabel>Image de la catégorie</FieldLabel>
                    <div className="space-y-4">
                      {/* Zone d'upload stylisée - carrée et réduite */}
                      <label
                        htmlFor="category-image"
                        className="relative flex flex-col items-center justify-center w-full aspect-square max-w-xs mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {categoryImagePreview ? (
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <img
                              src={categoryImagePreview}
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
                          id="category-image"
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <FieldDescription>
                      L'URL de l'image sera stockée dans le champ slug de la catégorie
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Libellé</FieldLabel>
                    <Input
                      type='text'
                      value={categoryForm.libelle}
                      onChange={e => setCategoryForm(prev => ({ ...prev, libelle: e.target.value }))}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      className='border rounded px-3 py-2 min-h-24'
                      value={categoryForm.description}
                      onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder='Décrivez la catégorie'
                    />
                    
                  </Field>

                  <Field>
                    <FieldLabel>Active</FieldLabel>
                    {/* UPDATED: use RadioGroup everywhere for radios */}
                    <RadioGroup
                      value={categoryForm.active}
                      onValueChange={(val) =>
                        setCategoryForm(prev => ({ ...prev, active: val as 'oui' | 'non' }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oui" id="active-oui" />
                        <Label htmlFor="active-oui">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non" id="active-non" />
                        <Label htmlFor="active-non">Non</Label>
                      </div>
                    </RadioGroup>
                  </Field>
                </FieldGroup>

                <div className='flex justify-end gap-2 pt-2'>
                  <Button 
                    variant='outline' 
                    type='button' 
                    onClick={() => {
                      setOpen(false)
                      setCategoryForm({
                        libelle: '',
                        description: '',
                        active: 'oui',
                        image: null,
                      })
                      setCategoryImagePreview(null)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type='submit' disabled={uploadingCategory}>
                    {uploadingCategory ? 'Création...' : 'Enregistrer la catégorie'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isUsers && (
            <div>
              <form className='space-y-4' onSubmit={handleSubmitUser}>
                <FieldGroup className='grid grid-cols-1 gap-4'>
                  <Field>
                    <FieldLabel>Email *</FieldLabel>
                    <Input
                      type='email'
                      value={userForm.email}
                      onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder='exemple@email.com'
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Mot de passe *</FieldLabel>
                    <Input
                      type='password'
                      value={userForm.password}
                      onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                      placeholder='Minimum 6 caractères'
                    />
                    <FieldDescription>
                      Le mot de passe doit contenir au moins 6 caractères
                    </FieldDescription>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Prénom *</FieldLabel>
                      <Input
                        type='text'
                        value={userForm.first_name}
                        onChange={e => setUserForm(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Nom *</FieldLabel>
                      <Input
                        type='text'
                        value={userForm.last_name}
                        onChange={e => setUserForm(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Téléphone</FieldLabel>
                    <Input
                      type='tel'
                      value={userForm.phone}
                      onChange={e => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder='+33 6 12 34 56 78'
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Rôle</FieldLabel>
                    <Select
                      value={userForm.role}
                      onValueChange={(val) =>
                        setUserForm(prev => ({ ...prev, role: val as 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Utilisateur</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                        <SelectItem value="MODERATOR">Modérateur</SelectItem>
                        <SelectItem value="ORGANIZER">Organisateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Note: Le rôle sera défini par défaut à USER lors de la création. Seuls les ADMIN peuvent modifier les rôles après création.
                    </FieldDescription>
                  </Field>
                </FieldGroup>

                <div className='flex justify-end gap-2 pt-2'>
                  <Button 
                    variant='outline' 
                    type='button' 
                    onClick={() => {
                      setOpen(false)
                      setUserForm({
                        email: '',
                        password: '',
                        first_name: '',
                        last_name: '',
                        phone: '',
                        role: 'USER',
                      })
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type='submit' disabled={uploadingUser}>
                    {uploadingUser ? 'Création...' : 'Créer l\'utilisateur'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}