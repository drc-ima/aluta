import { z } from "zod";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import type { SchoolClassPayload } from "@/types/schoolClass";
import { toast } from "sonner";
import { useCreateClass } from "../hooks";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, Trash2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "Enter Class name. Eg. Primary One, Grade 1, JSS 1, JHS Two."),
    level: z.number().min(0, "Enter the stage number of the class."),
    capacity: z.number().min(0, "Enter the capacity for each class"),
    sections: z.array(z.object({
        name: z.string().min(1, "Enter section name. Eg. A, Lilies, Roses")
    }))
})

type ClassForm = z.infer<typeof formSchema>

export default function CreateClassDialog({
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const form = useForm<ClassForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            level: 1,
            capacity: 1,
            sections: []
        }
    })

    const [searchParams, _] = useSearchParams()
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    const open = action == "create" ? true : false;

    const { selectedCampus } = useUserDefaultsProvider()
    const { isPending, mutate } = useCreateClass(selectedCampus !== null ? selectedCampus?.school_id : "", selectedCampus !== null ? selectedCampus.id : "")

    const {
        fields: sections,
        append: appendSection,
        remove: removeSection
    } = useFieldArray({
        control: form.control,
        name: "sections"
    })

    const handleSubmit = (data: ClassForm | SchoolClassPayload | any) => {
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
                        Create Class
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="class-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Class Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter class name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">Eg. Primary One</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-[1rem]">
                            <FormField
                                control={form.control}
                                name='level'
                                render={({ field }) => (
                                    <FormItem className="w-[50%]">
                                        <FormLabel>Stage</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'

                                                value={field.value}
                                                {...form.register("level", {
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
                                name='capacity'
                                render={() => (
                                    <FormItem className="w-[50%]">
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'

                                                {...form.register("capacity", {
                                                    valueAsNumber: true
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                    <Button type='submit' form='class-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}