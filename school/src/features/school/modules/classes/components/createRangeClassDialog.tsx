import { z } from "zod";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useCreateRangeClasses } from "../hooks";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { RangeSchoolClassPayload } from "@/types/schoolClass";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";


const formSchema = z.object({
    prefix: z.string().min(1, "Enter class prefix. Eg. Class, Grade, Level, JSS, JHS, SSS, SHS, Nursery"),
    start: z.number().min(0, "Enter the start range number"),
    end: z.number().min(0, 'Enter end of the range.'),
    capacity: z.number().min(0, "Enter the capacity for each class"),
    sections: z.array(z.object({
        name: z.string().min(1, "Enter section name. Eg. A, Lilies, Roses")
    }))
})

type RangeClassForm = z.infer<typeof formSchema>

export default function CreateRangeClassDialog({
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const form = useForm<RangeClassForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prefix: "",
            start: 1,
            end: 2,
            capacity: 1,
            sections: []
        }
    })

    const [searchParams, _] = useSearchParams()
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    const open = action == "create-range" ? true : false;

    const { selectedCampus } = useUserDefaultsProvider()
    const { isPending, mutate } = useCreateRangeClasses(selectedCampus?.school_id!, selectedCampus?.id!)

    const {
        fields: sections,
        append: appendSection,
        remove: removeSection
    } = useFieldArray({
        control: form.control,
        name: "sections"
    })
    const handleSubmit = (data: RangeClassForm | RangeSchoolClassPayload | any) => {
        mutate({
            ...data
        }, {
            onSuccess: () => {
                toast.success("New classes added successfully.")
                form.reset()
                if (goto) {
                    window.location.href = goto
                } else {
                    refetch()
                    handleOpenChange(false)
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error("Error creating classes")
            }
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                form.reset()
                handleOpenChange(open)
            }}
        >
            <DialogContent className="">
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2'>
                        Create Class Range
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="range-classes-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name='prefix'
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Class Prefix</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter class prefix'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">Eg. Class, Grade, Level, JSS, JHS, SSS, SHS, Nursery</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-[1rem]">
                            <FormField
                                control={form.control}
                                name='start'
                                render={({ field }) => (
                                    <FormItem className="w-[50%]">
                                        <FormLabel>Start</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'

                                                value={field.value}
                                                {...form.register("start", {
                                                    valueAsNumber: true
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='end'
                                render={() => (
                                    <FormItem className="w-[50%]">
                                        <FormLabel>End</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'

                                                {...form.register("end", {
                                                    valueAsNumber: true
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name='capacity'
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Capacity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            placeholder='Enter class capacity'
                                            value={field.value}
                                            {...form.register("capacity", {
                                                valueAsNumber: true
                                            })}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs!">Enter the capacity for each class.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button
                                size={"sm"}
                                type="button"
                                variant={"outline"}
                                onClick={() => {
                                    appendSection({
                                        name: ""
                                    })
                                }}
                            >
                                <PlusIcon />
                                Add Section
                            </Button>
                        </div>
                        {
                            sections.map((_, index) => {
                                return (
                                    <div key={index} className="flex gap-[1rem] items-end">
                                        <FormField
                                            control={form.control}
                                            name={`sections.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Section Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='text'

                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            size={"icon"}
                                            variant={"destructive"}
                                            onClick={() => {
                                                removeSection(index)
                                            }}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                )
                            })
                        }
                    </form>
                </Form>
                <DialogFooter className='gap-y-2 mx-auto w-full'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='range-classes-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}