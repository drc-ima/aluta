import { Main } from "@/components/layout/main"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react";

type PageProps = {
    title: string;
    description?: string;
    actions?: ButtonProps[],
    children: React.ReactNode,
    topNavs?: {
        children: string,
        id: string,
        disabled: false,
    }[]
}
export default function PageWrapper({
    title = "Page Title",
    actions,
    topNavs,
    description,
    children

}: PageProps) {
    const defaultValue = window.location.hash.replace("#", "") || topNavs && topNavs[0].id

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
                    {
                        topNavs && (
                            <Tabs
                                orientation='vertical'
                                defaultValue={defaultValue}
                                

                            >
                                <div className='w-full overflow-x-auto'>
                                    <TabsList>
                                        {
                                            topNavs.map((topNav, id) => (
                                                <TabsTrigger key={id} value={topNav.id} {...topNav} onClick={() => {
                                                    window.location.hash = topNav.id
                                                }} />
                                            ))
                                        }
                                    </TabsList>
                                </div>
                                {children}
                            </Tabs>
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
            {!topNavs && children}
        </Main>
    )
}