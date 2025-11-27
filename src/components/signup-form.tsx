import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-1 items-center text-center ">
          <h1 className="text-2xl font-bold">Créer votre compte</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Remplissez le formulaire ci-dessous pour créer votre compte
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nom complet</FieldLabel>
          <Input id="name" type="text" placeholder="Jean Dupont" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="sport">Discipline sportive</FieldLabel>
          <Select>
            <SelectTrigger id="sport">
              <SelectValue placeholder="Sélectionnez une discipline" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="football">Football</SelectItem>
              <SelectItem value="basketball">Basketball</SelectItem>
              <SelectItem value="tennis">Tennis</SelectItem>
              <SelectItem value="natation">Natation</SelectItem>
              <SelectItem value="course">Course à pied</SelectItem>
              <SelectItem value="cyclisme">Cyclisme</SelectItem>
              <SelectItem value="volleyball">Volleyball</SelectItem>
              <SelectItem value="badminton">Badminton</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </Field>
     
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" type="email" placeholder="m@exemple.com" required />
          {/* <FieldDescription>
            Nous l&apos;utiliserons pour vous contacter. Nous ne partagerons jamais votre e-mail avec quiconque.
          </FieldDescription> */}
        </Field>
      
          <Field>
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Input id="password" type="password" required />
            <FieldDescription>Minimum 8 caractères.</FieldDescription>
          </Field>
          {/* <Field>
            <FieldLabel htmlFor="confirm-password">Confirmer</FieldLabel>
            <Input id="confirm-password" type="password" required />
            <FieldDescription>Confirmez votre mot de passe.</FieldDescription>
          </Field> */}
        
        <Field>
          <Button type="submit" className="w-full">
            Créer un compte
          </Button>
        </Field>
        <FieldSeparator>Ou </FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-1">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
             Continuer avec Google
            </Button>
          </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Vous avez déjà un compte ? <a href="/login">Se connecter</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
