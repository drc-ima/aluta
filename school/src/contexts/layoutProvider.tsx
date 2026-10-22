import { createContext, useContext, useState } from "react"

// Default values
const DEFAULT_VARIANT = 'inset'
const DEFAULT_COLLAPSIBLE = 'icon'

type LayoutContextType = {
  navLinks: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[],
  changeNavLinks: (navLinks: LayoutContextType["navLinks"]) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

type LayoutProviderProps = {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
    const [navLinks, setNavLinks] = useState<LayoutContextType["navLinks"]>([])

    const changeNavLinks = (navLinks: LayoutContextType["navLinks"]) => {
        setNavLinks(navLinks)
    }
    const contextValue: LayoutContextType = {
        navLinks,
        changeNavLinks
    }

    return <LayoutContext value={contextValue}>{children}</LayoutContext>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}