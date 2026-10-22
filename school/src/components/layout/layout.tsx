import { useAuth } from "@/contexts/authProvider";
import { cn } from "@/libs/utils";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { AlutaSchoolTitle } from "./alutaSchooTitle";
import { Sidebar, SidebarHeader, SidebarInset, SidebarProvider } from "./sidebar";
import { ProfileDropdown } from "../profileDropdown";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { NavigationProgress } from "../navigationProgress";
import { CampusSwitcher } from "../campusSwitcher";
import { ThemeSwitch } from "../themeSwitch";
import { SidebarContents } from "./sidebarContents";
import { TopNav } from "./topNav";
import { useLayout } from "@/contexts/layoutProvider";



export function Layout({ children }: { children?: React.ReactNode }) {
  const { navLinks } = useLayout()
  return (
    <>
      <NavigationProgress />
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <CampusSwitcher />

            {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
            {/* <AppTitle /> */}
          </SidebarHeader>
          <SidebarContents />
        </Sidebar>
        <SidebarInset
          className={cn(
            // Set content container, so we can use container queries
            '@container/content',

            // If layout is fixed, set the height
            // to 100svh to prevent overflow
            'has-data-[layout=fixed]:h-svh',

            // If layout is fixed and sidebar is inset,
            // set the height to 100svh - spacing (total margins) to prevent overflow
            'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
          )}
        >
          <div className='flex min-h-0 flex-1 flex-col'>
            <Header fixed>
              <TopNav links={navLinks} className='me-auto' />
              <ThemeSwitch />
              <ProfileDropdown />
            </Header>
            {children || <Outlet />}
          </div>
          {/* <Footer /> */}
        </SidebarInset>
      </SidebarProvider>
    </>


  )
}