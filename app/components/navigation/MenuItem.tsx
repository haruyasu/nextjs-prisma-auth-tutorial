'use client'

type MenuItemProps = {
  onClick: () => void
  label: string
}

// メニューアイテム
const MenuItem: React.FC<MenuItemProps> = ({ onClick, label }) => {
  return (
    <div
      onClick={onClick}
      className="px-4 py-3 text-center font-bold transition hover:bg-neutral-100"
    >
      {label}
    </div>
  )
}

export default MenuItem
