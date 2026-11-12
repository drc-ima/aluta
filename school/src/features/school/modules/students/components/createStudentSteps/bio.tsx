import { DatePicker } from "@/components/datePicker";
import ProfileUploader from "@/components/profileUploader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { StudentPayload } from "../../api";
import { useClassrooms } from "../../../academics/hooks";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";

const formSchema = z.object({
    profile: z.file().nullable(),
    admission_date: z.date(),
    admission_number: z.string().min(1, "Enter admission number."),
    first_name: z.string().min(1, "Enter first name"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Enter last name"),
    date_of_birth: z.date(),
    gender: z.string().min(1, "Select a gender."),
    classroom_id: z.string().min(1, "Select a classroom"),
    enrolled_at: z.date()
})

export type BioForm = z.infer<typeof formSchema>

type Props = {
    onContinue: (bioData: BioForm) => void
    data: StudentPayload
}
export default function Bio({
    onContinue,
    data
}: Props) {
    const form = useForm<BioForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            profile: data.bio.profile,
            admission_date: data.bio.admission_date,
            admission_number: data.bio.admission_number,
            first_name: data.bio.first_name,
            last_name: data.bio.last_name,
            middle_name: data.bio.middle_name,
            date_of_birth: data.bio.date_of_birth,
            gender: data.bio.gender,
            classroom_id: data.bio.classroom_id,
            enrolled_at: data.bio.enrolled_at
        }
    })

    const { selectedSchool, currentAcademicYear } = useUserDefaultsProvider()
    const {
        data: classrooms = []
    } = useClassrooms(selectedSchool?.id!, currentAcademicYear?.id!)

    const handleSubmit = (data: BioForm) => {
        onContinue(data)
    }
    return (
        <div className="flex flex-col gap-[1rem] p-[1rem]">
            <span className="font-semibold text-[1.3rem]">Student Information</span>
            <Separator />
            <Form {...form}>
                <form
                    id="bio-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-[1rem] flex-1 overflow-auto"
                >
                    <div className="flex gap-[1rem] items-center">
                        <FormField
                            control={form.control}
                            name="profile"
                            render={({ field }) => (
                                <FormItem>
                                    <ProfileUploader
                                        file={field.value}
                                        required={false}
                                        {...field}
                                        handleChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>

                            )}
                        />
                        <FormField
                            control={form.control}
                            name="admission_date"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Admission Date</FormLabel>
                                    <DatePicker
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        maxDate={new Date()}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="admission_number"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Admission Number</FormLabel>
                                    <Input
                                        type='text'
                                        placeholder="Enter admission number"
                                        {...field}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-[1rem] items-center">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter first name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="middle_name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Middle Name (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter middle name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder='Enter last name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-[1rem] items-center">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value ? field.value : ""}>
                                        <FormControl className="w-full">
                                            <SelectTrigger>
                                                <SelectValue placeholder='Choose gender' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="w-full">
                                            <SelectItem value={"MALE"}>Male</SelectItem>
                                            <SelectItem value={"FEMALE"}>Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Date of Birth</FormLabel>
                                    <DatePicker
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        maxDate={new Date()}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-[1rem]">
                        <FormField
                            control={form.control}
                            name="classroom_id"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Enrolled Clasroom</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value ? field.value : ""}>
                                        <FormControl className="w-full">
                                            <SelectTrigger>
                                                <SelectValue placeholder='Choose classroom from current academic year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="w-full">
                                            {
                                                classrooms.map((classroom, index) => (
                                                    <SelectItem key={index} value={classroom.id}>{classroom.school_class.name} {classroom.school_class.section}</SelectItem>
                                                ))
                                            }


                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="enrolled_at"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Enrollment Date</FormLabel>
                                    <DatePicker
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        maxDate={new Date()}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                </form>
            </Form>
            <div className="my-auto flex justify-end items-center">
                <Button type='submit' form='bio-form'>
                    <span>Next</span>
                </Button>
            </div>
        </div>
    )
}