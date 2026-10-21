import { Link, useNavigate } from 'react-router-dom'
import useDialogState from '@/hooks/useDialogState'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { useAuth } from '@/contexts/authProvider'
import { useUserDefaultsProvider } from '@/contexts/userDefaultProvider'
import { useLogout } from '@/features/auth/hooks'
// import { SignOutDialog } from '@/components/sign-out-dialog'


export function ProfileDropdown() {
  const { user } = useAuth()
  // const [open, setOpen] = useDialogState()
  const { selectedSchool, schoolRole } = useUserDefaultsProvider();
  const navigate = useNavigate();

  const {
    mutateAsync: logoutMutate
  } = useLogout()

  const handleLogout = async() => {

    await logoutMutate(
      undefined,
      {
        onSuccess() {
          localStorage.removeItem("aluta_sess")
          navigate("/")
        },
      }
    )
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt='@shadcn' />
              <AvatarFallback>{user?.first_name[0].toUpperCase()}{user?.last_name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{user?.first_name} {user?.last_name}</p>
              
              {
                selectedSchool && (
                  <p className='text-xs leading-none text-wrap text-muted-foreground'>
                    {selectedSchool?.name}
                  </p>
                )
              }
              {
                schoolRole && (
                  <p className='text-xs leading-none text-wrap text-muted-foreground'>
                    {schoolRole?.name}
                  </p>
                )
              }
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={async() => {
            await handleLogout()
          }}>
            Sign out
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <SignOutDialog open={!!open} onOpenChange={setOpen} /> */}
    </>
  )
}
