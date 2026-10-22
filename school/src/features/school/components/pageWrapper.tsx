import { Main } from "@/components/layout/main"
import { Button, type ButtonProps } from "@/components/ui/button"


type PageProps = {
    title: string;
    description?: string;
    actions?: ButtonProps[],
    children: React.ReactNode
}
export default function PageWrapper({
    title = "Page Title",
    actions,
    description,
    children

}: PageProps) {
    
    return (
        <Main>
            <div className='mb-2 flex items-start justify-between py-2'>
                <div className="flex flex-col gap-2">
                    <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
                    {
                        description && (
                            <p className='text-muted-foreground text-sm'>
                                {description}
                            </p>
                        )
                    }
                    

                </div>
                <div className='flex items-center px-2'>
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