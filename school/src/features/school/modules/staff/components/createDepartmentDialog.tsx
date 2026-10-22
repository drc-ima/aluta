import { z } from "zod";
import type { CreateDialogProps } from "./createPositionDrawer";
import { useForm } from "react-hook-form";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useCreateSchoolDepartment } from "@/features/school/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DepartmentPayload } from "@/features/school/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    description: z.string().optional(),
})

type DepartmentForm = z.infer<typeof formSchema>
export default function CreateDepartmentDialog({
    open,
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const form = useForm<DepartmentForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        }
    })
    const { selectedSchool } = useUserDefaultsProvider()
    const { isPending, mutate } = useCreateSchoolDepartment(selectedSchool?.id)

    const handleSubmit = (data: DepartmentForm | DepartmentPayload | any) => {

        mutate({
            ...data
        }, {
            onSuccess: (data) => {
                toast.success("New department added successfully.")
                console.log(data)
                refetch()
                handleOpenChange(false)
            },
            onError: (error) => {
                console.error(error)
                toast.error("Error creating department")
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
            <DialogContent className='sm:max-w-md'>
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2'>
                        Add Department
                    </DialogTitle>
                    
                </DialogHeader>
                <Form {...form}>
                    <form
                        id='department-form'
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter name of department'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem className=''>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            //   className='resize-none'
                                            placeholder='More details about the department'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter className='gap-y-2'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='department-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}