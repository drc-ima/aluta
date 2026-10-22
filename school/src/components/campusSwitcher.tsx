import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/layout/sidebar'
import { useUserDefaultsProvider } from '@/contexts/userDefaultProvider'


export function CampusSwitcher() {
  const { isMobile } = useSidebar()
  const { schoolsCampuses, selectedCampus, selectedSchool } = useUserDefaultsProvider()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                {/* <activeTeam.logo className='size-4' /> */}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight '>
                <span className='text-wrap font-semibold'>
                  {selectedSchool?.name}
                </span>
                <span className='truncate text-xs'>{selectedCampus?.name}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Locations
            </DropdownMenuLabel>
            {schoolsCampuses && schoolsCampuses.filter(sc => sc.campus_id !== selectedCampus?.id).map((sc, index) => (
              <DropdownMenuItem
                key={sc.campus_name}
                // onClick={() => setActiveTeam(team)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  {/* <team.logo className='size-4 shrink-0' /> */}
                </div>
                {sc.campus_name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium text-muted-foreground'>Add Location</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
