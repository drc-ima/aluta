import { cn } from '@/libs/utils.ts'
import { Outlet } from 'react-router-dom'

export default function Layout() {


    return (
        <div className='relative container overflow-hidden grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
            <div className='lg:p-8 w-full h-full overflow-x-auto'>
                <div className='mx-auto w-full h-full max-w-sm '>
                    <Outlet />
                </div>
            </div>

            <div
                className={cn(
                    'relative h-full overflow-auto bg-muted max-lg:hidden',
                    '[&>img]:absolute  [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none'
                )}
            >
                <img
                    src={"/auth_banner.jpg"}
                    alt='Students Banners'
                />
            </div>
        </div>
    )
}
