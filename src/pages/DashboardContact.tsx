import ContactDataTable from "@/components/data/contact-data-table"

export default function DashboardContact() {
  return (
    <div className="p-6">
      <div className="mb-2 flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages de contact</h1>
          <p className="text-muted-foreground">
            Consultez et répondez aux messages de contact reçus.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ContactDataTable />
      </div>
    </div>
  )
}

