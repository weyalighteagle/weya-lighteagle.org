import type { ChatStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: ChatStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    idle: { label: "Idle", className: "bg-gray-100 text-gray-700" },
    listening: { label: "Listening", className: "bg-green-100 text-green-700" },
    processing: { label: "Thinking", className: "bg-yellow-100 text-yellow-700" },
    speaking: { label: "Speaking", className: "bg-blue-100 text-blue-700" },
  }

  const config = statusConfig[status]

  return <div className={`rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>{config.label}</div>
}
