import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// ADD: imports for form controls and layout similar to your signup form
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Settings() {
  // ADD: local tab state for sidebar navigation
  const [tab, setTab] = React.useState<"profile" | "account" | "appearance" | "notifications" | "display">("profile")

  // ADD: simple local form state reusing your signup fields
  const [form, setForm] = React.useState({
    name: "",
    sport: "",
    email: "",
    password: "",
    bio: "",
    url1: "",
    url2: "",
  })
  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          {/* CHANGED: header to match Settings page */}
          <CardTitle className="text-2xl">Paramètres</CardTitle>
          {/* Optional subtext */}
          <p className="text-muted-foreground text-sm">
            Gérez les paramètres de votre compte et vos préférences e‑mail.
          </p>
        </CardHeader>
        <CardContent>
          {/* INSERT: two-column layout with sidebar and content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 md:col-span-3">
              <nav className="flex md:flex-col gap-2">
                <Button variant={tab === "profile" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("profile")}>
                  Profile
                </Button>
                <Button variant={tab === "account" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("account")}>
                  Account
                </Button>
                <Button variant={tab === "appearance" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("appearance")}>
                  Appearance
                </Button>
                <Button variant={tab === "notifications" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("notifications")}>
                  Notifications
                </Button>
                <Button variant={tab === "display" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("display")}>
                  Display
                </Button>
              </nav>
            </aside>

            {/* Content */}
            <section className="col-span-12 md:col-span-9">
              {/* PROFILE TAB */}
              {tab === "profile" && (
                <form
                  className="flex flex-col gap-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // TODO: persist profile settings via API
                    console.log("Saving profile", form)
                  }}
                >
                  <FieldGroup>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold">Profile</h2>
                      <p className="text-muted-foreground text-sm">This is how others will see you on the site.</p>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="name">Username</FieldLabel>
                      <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="shadcn" />
                      <FieldDescription>
                        This is your public display name. It can be your real name or a pseudonym.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Select value={form.email} onValueChange={(v) => update("email", v)}>
                        <SelectTrigger id="email">
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m@exemple.com">m@exemple.com</SelectItem>
                          <SelectItem value="contact@exemple.com">contact@exemple.com</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>You can manage verified email addresses in your email settings.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="sport">Discipline sportive</FieldLabel>
                      <Select value={form.sport} onValueChange={(v) => update("sport", v)}>
                        <SelectTrigger id="sport">
                          <SelectValue placeholder="Sélectionnez une discipline" />
                        </SelectTrigger>
                        <SelectContent>
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


                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button type="button" variant="outline">Cancel</Button>
                    </div>
                  </FieldGroup>
                </form>
              )}

              {/* ACCOUNT TAB */}
              {tab === "account" && (
                <form
                  className="flex flex-col gap-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // TODO: persist account settings via API
                    console.log("Saving account", { password: form.password })
                  }}
                >
                  <FieldGroup>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold">Account</h2>
                      <p className="text-muted-foreground text-sm">Change sensitive account information.</p>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                      <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
                      <FieldDescription>Minimum 8 caractères.</FieldDescription>
                    </Field>

                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button type="button" variant="outline">Cancel</Button>
                    </div>
                  </FieldGroup>
                </form>
              )}

              {/* PLACEHOLDER TABS */}
              {tab === "appearance" && <div className="text-muted-foreground">Appearance settings coming soon…</div>}
              {tab === "notifications" && <div className="text-muted-foreground">Notification settings coming soon…</div>}
              {tab === "display" && <div className="text-muted-foreground">Display settings coming soon…</div>}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
