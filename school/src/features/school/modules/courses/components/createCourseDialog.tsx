import { z } from "zod";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { useCreateCourse } from "../hooks";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Enter course name."),
    code: z.string().min(1, "Enter course code"),
    description: z.string().optional(),
    department_id: z.string().min(1, "Select a department.")
})

type CourseForm = z.infer<typeof formSchema>

export default function CreateCourseDialog({
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const form = useForm<CourseForm>(({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            department_id: "",
            code: ""
        }
    }))
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    const open = action == "create" ? true : false;

    const { selectedSchool } = useUserDefaultsProvider();

    const {
        isPending, mutate
    } = useCreateCourse(selectedSchool?.id ?? "")
    const handleSubmit = (data: CourseForm) => {
        mutate({
            ...data
        }, {
            onSuccess: () => {
                toast.success("New course added successfully.")
                form.reset()
                if (goto) {
                    window.location.href = goto
                } else {
                    refetch()
                    form.reset()
                    handleOpenChange(false)
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error("Error creating course.")
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
                        Create Course
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="course-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col gap-[1rem] py-4"
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter course name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='code'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter course code'
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
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder='Enter a description' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-end gap-[0.5rem]">
                            <FormField
                                control={form.control}
                                name='department_id'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Department (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value ? field.value : ""}>
                                            <FormControl className="w-full">
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select department' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="w-full">
                                                {
                                                    selectedSchool !== null && selectedSchool.departments.map(department => (
                                                        <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                                                    ))
                                                }

                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant={"outline"}
                                onClick={() => {
                                    navigate(`/staff/departments?action=create&return-to=/courses?action=create`)
                                }}
                                size={"sm"}
                                title="Add a new department"
                            >
                                <PlusIcon />
                            </Button>
                        </div>

                    </form>
                </Form>
                <DialogFooter className='gap-y-2'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='course-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}