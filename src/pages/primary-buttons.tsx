import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"

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


export function PrimaryButtons() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isEvents = location.pathname === ('/dashboard/events')
  const isEventsCategory = location.pathname.startsWith('/dashboard/events_category')
 const isUsers = location.pathname === ('/dashboard/users')

  const handleAddClick = () => {
    if (isEvents || isEventsCategory) setOpen(true)
  }

  // Submit handlers (wire these to your API/Redux/etc. as needed)
  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to your backend
    // console.log('eventForm', eventForm)
    setOpen(false)
  }

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to your backend
    // console.log('categoryForm', categoryForm)
    setOpen(false)
  }

  const handleEventImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setEventForm(prev => ({ ...prev, images: files }))
  }

  // Remove ID and add single/multi-day date handling
  const [eventForm, setEventForm] = useState({
    nom: '',
    // single day
    date: '',
    // multi day
    startDate: '',
    endDate: '',
    isMultiDay: false,
    category: '',
    payant: 'non' as 'oui' | 'non',
    organisateur: '',
    places: '',
    images: [] as File[],
  })
  const [categoryForm, setCategoryForm] = useState({
    // removed id
    libelle: '',
    description: '',
    active: 'oui' as 'oui' | 'non',
  })

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
      >
        <span>Exporter</span> <Download size={18} />
      </Button>
    
    {/* Hide "Ajouter" on Users page */}
     {!isUsers && (
       <Button className='space-x-1' onClick={handleAddClick}>
         <span>Ajouter</span> <Plus size={18} />
       </Button>
     )}

      {/* add padding to the sheet to avoid fields touching edges */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className='p-4 sm:p-6'>
          <SheetHeader>
            <SheetTitle>
              {isEvents
                ? 'Ajouter un évènement'
                : isEventsCategory
                ? 'Ajouter une catégorie d’évènements'
                : 'Ajouter'}
            </SheetTitle>
          </SheetHeader>

          {isEvents && (
            <div>
              {/* Place your event creation form component here */}
              {/* Inline form for event creation */}
              <form className='space-y-4' onSubmit={handleSubmitEvent}>
                {/* Group fields and add separators for spacing */}
                <FieldGroup className='grid grid-cols-1 gap-4'>
                  {/* removed ID field */}

                  <Field>
                    <FieldLabel>Nom</FieldLabel>
                    <Input
                      type='text'
                      value={eventForm.nom}
                      onChange={e => setEventForm(prev => ({ ...prev, nom: e.target.value }))}
                      required
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
                    <Field>
                      <FieldLabel>Date</FieldLabel>
                      <Input
                        type='date'
                        value={eventForm.date}
                        onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </Field>
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
                        <FieldLabel>Date de fin</FieldLabel>
                        <Input
                          type='date'
                          value={eventForm.endDate}
                          min={eventForm.startDate || undefined}
                          onChange={e => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                          required
                        />
                      </Field>
                    </FieldGroup>
                  )}

                  <FieldSeparator />

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
                    <FieldLabel>Images</FieldLabel>
                    <Input
                      type='file'
                      multiple
                      accept='image/*'
                      onChange={handleEventImages}
                    />
                    <FieldDescription>Vous pouvez sélectionner plusieurs images.</FieldDescription>
                  </Field>
                </FieldGroup>

                <div className='flex justify-end gap-2 pt-2'>
                  <Button variant='outline' type='button' onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type='submit'>Enregistrer l’évènement</Button>
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
                  {/* removed ID field */}

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
                  <Button variant='outline' type='button' onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type='submit'>Enregistrer la catégorie</Button>
                </div>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}