// Add proper type definitions for sidebar items

import { JSX } from "react"

type MenuItem = {
  label: string
  active?: boolean
}

export default function Sidebar(): JSX.Element {
  const menuItems: MenuItem[] = [
    { label: "Summary", active: true },
    { label: "News" },
    { label: "Chart" },
    { label: "Community" },
    { label: "Historical Data" },
    { label: "Options" },
    { label: "Components" },
  ]

  return (
    <div className="space-y-1">
      {menuItems.map((item, index) => (
        <a
          key={index}
          href="#"
          className={`block px-3 py-2 text-sm rounded hover:bg-gray-100 ${
            item.active ? "text-purple-600 font-medium" : "text-gray-700"
          }`}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
