import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminNavbar() {
  const { admin } = useAdminAuth()

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{admin?.email}</p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </div>
  )
}
