import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateSchoolPosition } from "../hooks";
import { EmploymentType, type PositionPayload } from "../api";


const formSchema = z.object({
    name: z.string().min(1, "Job title name is required"),
    description: z.string().optional(),
    employment_type: z.string().min(1, "Please chose an employment type."),
    rank: z.string().optional()
})

type PositionForm = z.infer<typeof formSchema>

export type CreateDialogProps = {
    handleOpenChange: (open: boolean) => void,
    refetch: () => void;
}

export function CreatePositionDrawer({
    handleOpenChange,
    refetch
}: CreateDialogProps) {

    const form = useForm<PositionForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            employment_type: "",
            rank: ""
        }
    })
    const { selectedSchool } = useUserDefaultsProvider()
    const { isPending, mutate } = useCreateSchoolPosition(selectedSchool !== null ? selectedSchool?.id : "")
    const [searchParams, _] = useSearchParams()
    const navigate = useNavigate()
    const goto = searchParams.get("returnTo") || "";
    const action = searchParams.get("action") || "";

    const open = action == "create" ? true : false;


    const handleSubmit = (data: PositionForm | PositionPayload | any) => {

        mutate({
            ...data
        }, {
            onSuccess: () => {
                toast.success("New job title added successfully.")
                if (goto) {
                    navigate(goto)
                } else {
                    refetch()
                    handleOpenChange(false)
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error("Error creating job title")
            }
        })
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(open) => {
                if (goto) {
                    navigate(goto)
                } else {
                    form.reset()
                    handleOpenChange(open)
                }
            }}
        >
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-start'>
                    <SheetTitle>Create Job Title</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                    <form
                        id="position-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex-1 py-6 px-4 overflow-y-auto flex flex-col gap-[1rem]"
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Enter a title' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder='Enter a title' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`employment_type`}
                            render={({ field }) => {
                                return (
                                    <FormItem >
                                        <FormLabel>Employment Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>

                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Choose employment type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {
                                                    Object.values(EmploymentType).map((type) => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name='rank'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rank</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Enter the rank for this position' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <SheetFooter className='gap-2'>
                    <SheetClose asChild>
                        <Button variant='outline'>Close</Button>
                    </SheetClose>
                    <Button form='position-form' type='submit' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}