import { ArrowRightIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"

type ClassCardT = {
    title: string
    attrs: {
        key: string
        value: any
    }[]
    id: string
    href?: string
}

const ClassroomCard: React.FC<ClassCardT> = ({
    href = "#",
    title,
    attrs = [],
    id
}) => {
    const navigate = useNavigate()
    return (
        <div id={id} className="flex flex-col rounded-sm shadow-sm w-full">
            <div className="p-[1rem] border-b">
                <span className="font-semibold">{title}</span>
            </div>
            <dl className="flex-grow-1 min-h-[1rem]! grid grid-cols-[auto_1fr]">
                {
                    attrs.map((attr, index) => {
                        return (
                            <div key={index} className="py-[0.5rem] px-[1rem] border-b text-sm grid grid-cols-[subgrid] col-span-2 gap-[0.5rem] overflow-wrap-anywhere">
                                <dt className="min-w-[88px] items-center grid">{attr.key}:</dt>
                                <dd className="min-w-[0] flex">{attr.value}</dd>
                            </div>
                        )
                    })
                }

            </dl>
            <div className="mx-auto w-full! flex p-[1rem] justify-end">
                <Button
                    size={"icon"}
                    className="rounded-full!"
                    variant={"default"}
                    onClick={() => navigate(href)}
                >
                    <ArrowRightIcon />
                </Button>
            </div>
        </div>
    )
}

export default ClassroomCard