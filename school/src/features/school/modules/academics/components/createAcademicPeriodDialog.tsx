import { z } from "zod";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useCreateAcademicPeriod } from "@/hooks/queries";
import type { AcademicPeriodPayload, AcademicPeriodT } from "@/types/academicPeriod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/datePicker";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


const formSchema = z.object({
    name: z.string().min(1, "Enter the discription of of the academic year."),
    start_date: z.string(),
    end_date: z.string(),
    parent_id: z.string().nullable()
})

type AcademicPeriodForm = z.infer<typeof formSchema>

export default function CreateAcademicPeriodDialog({
    handleOpenChange,
    refetch,
    periods
}: CreateDialogProps & { periods: AcademicPeriodT[] }) {
    const [searchParams, _] = useSearchParams()

    const goto = searchParams.get("returnTo") || "";
    const action = searchParams.get("academicPeriod") || "";
    const parent_id = searchParams.get("parent_id");

    const form = useForm<AcademicPeriodForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            start_date: new Date().toString(),
            end_date: new Date().toString(),
            parent_id: parent_id
        }
    })
    const open = action == "create" ? true : false;

    const { selectedCampus } = useUserDefaultsProvider()
    const { isPending, mutate } = useCreateAcademicPeriod(selectedCampus?.id!, selectedCampus?.school_id!)

    const handleSubmit = (data: AcademicPeriodForm | AcademicPeriodPayload | any) => {
        mutate({
            ...data,
            parent_id: data.parent_id || parent_id
        }, {
            onSuccess: () => {
                toast.success("New academic period added successfully.")
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
                toast.error("Error creating academic period")
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
                        Create Academic Period
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="academic-period-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name={`parent_id`}
                            
                            render={({ field }) => {
                                field.value = parent_id;
                                return (
                                    <FormItem hidden={parent_id === null}>
                                        <FormLabel>Academic Year</FormLabel>
                                        <Select disabled={parent_id !== null} onValueChange={field.onChange} defaultValue={parent_id ? parent_id : field.value!}>
                                            <FormControl className="w-full">
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select academic year' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="w-full">
                                                {
                                                    periods.map(period => (
                                                        <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
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
                            name='name'
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Academic Period</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter academic period'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs!">Eg. 2026/2027 Academic Year, 1st Term, 2nd Semester</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`start_date`}
                            render={({ field }) => (
                                <FormItem className='flex flex-col flex-1'>
                                    <FormLabel>Start Date</FormLabel>
                                    <DatePicker
                                        selected={field.value.toString()}
                                        onSelect={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`end_date`}
                            render={({ field }) => (
                                <FormItem className='flex flex-col flex-1'>
                                    <FormLabel>End Date</FormLabel>
                                    <DatePicker selected={field.value.toString()} onSelect={field.onChange} />

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter className='gap-y-2 mx-auto w-full'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='academic-period-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}