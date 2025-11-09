import { PrimaryButtons } from "./primary-buttons";
// ADD: import the Users data table component
import UsersDataTable from "@/components/data/users-data-table";

export default function Users() {
  return (
    <div className="p-6">
      <div className="mb-2 flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Consultez et administrez les comptes utilisateurs de la plateforme.
          </p>
        </div>
        <PrimaryButtons />
      </div>

      {/* Insert the table below the header */}
      <div className="mt-4">
        <UsersDataTable />
      </div>
    </div>

  )
}
