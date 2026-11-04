import { Main } from "@/components/layout/main"
import { Button, type ButtonProps } from "@/components/ui/button"


type PageProps = {
    title: string | React.ReactNode
    description?: string
    actions?: ButtonProps[]
    className?: string
    children: React.ReactNode
}
export default function PageWrapper({
    title = "Page Title",
    actions,
    description,
    className,
    children
}: PageProps) {
    
    return (
        <Main className={className}>
            <div className='mb-2 flex items-start justify-between py-2'>
                <div className="flex flex-col gap-2">
                    {
                        typeof title == "string" ? <h1 className='text-2xl font-bold tracking-tight'>{title}</h1> : title
                    }
                    
                    {
                        description && (
                            <p className='text-muted-foreground text-sm'>
                                {description}
                            </p>
                        )
                    }
                    

                </div>
                <div className='flex items-center px-2 gap-[0.5rem]'>
                    {
                        actions && actions.map((action, index) => {
                            return <Button key={index} {...action} />
                        })
                    }

                </div>
            </div>
            {children}
        </Main>
    )
}