import { z } from "zod";
import type { StudentPayload } from "../../api";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuardianRelationshipType } from "@/types/student";

const formSchema = z.object({
    guardians: z.array(
        z.object({
            guardian_id: z.string().optional().nullable(),
            phone: z.string().min(1, "Enter phone number"),
            email: z.email().optional(),
            relationship_type: z.string().min(1, "Select relationship type"),
            first_name: z.string().min(1, "Enter first name"),
            last_name: z.string().min(1, "Enter last name"),
        })
    ).max(2, "Provide maximum 2 guardians.")
})

export type GuardiansForm = z.infer<typeof formSchema>

type Props = {
    onContinue: (guardianData: GuardiansForm['guardians']) => void
    data: StudentPayload,
    setActiveStep: any
    loading: boolean
}

export default function Guardians({
    onContinue,
    setActiveStep,
    loading, data
}: Props) {
    const form = useForm<GuardiansForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            guardians: data.guardians
        }
    })

    const { fields: fieldsets, append, remove } = useFieldArray({
        control: form.control,
        name: "guardians"
    })

    const handleSubmit = (data: GuardiansForm) => {
        onContinue(data.guardians)
    }
    return (
        <div className="flex flex-col gap-[1rem] p-[1rem] h-full! overflow-hidden">
            <span className="font-semibold text-[1.3rem]">Guardians Information</span>
            <Separator />
            <Form {...form}>
                <form
                    id="guardians-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-[1rem] flex-1 overflow-auto"
                >
                    
                    <div className="flex justify-between">
                        <span>
                            {
                                form.formState.errors.guardians?.root && (
                                    <div className="text-sm text-destructive">
                                        {form.formState.errors.guardians?.root.message}
                                    </div>
                                )
                            }
                        </span>

                        <Button
                            type="button"
                            size={"sm"}
                            variant={"outline"}
                            onClick={() => append({
                                guardian_id: null,
                                phone: "",
                                email: "",
                                first_name: "",
                                last_name: "",
                                relationship_type: ""
                            })}
                        >
                            <PlusIcon /> Add Guardian
                        </Button>
                    </div>
                    {
                        fieldsets.map((fieldset, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-[1rem]">
                                    <div className="flex gap-[1rem] items-center">
                                        <FormField
                                            control={form.control}
                                            name={`guardians.${index}.first_name`}
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
                                            name={`guardians.${index}.last_name`}
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
                                        <FormField
                                            control={form.control}
                                            name={`guardians.${index}.relationship_type`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Relationship</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value ? field.value : ""}>
                                                        <FormControl className="w-full">
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Choose relationship with student' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="w-full">
                                                            {
                                                                Object.values(GuardianRelationshipType).map((grt, index) => (
                                                                    <SelectItem key={index} value={grt}>{grt}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex gap-[1rem] items-end">
                                        <FormField
                                            control={form.control}
                                            name={`guardians.${index}.phone`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='text'
                                                            placeholder='Enter phone number'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`guardians.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='text'
                                                            placeholder='Enter email address'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            className="rounded-full text-destructive!"
                                            variant={"secondary"}
                                            type="button"
                                            onClick={() => {
                                                if (index === 0) {
                                                    toast.error("Please add at least one guardian")
                                                    return
                                                }
                                                remove(index)
                                            }}
                                        >
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                    <Separator />
                                </div>
                            )
                        })
                    }

                </form>
            </Form>
            <div className="my-auto flex justify-between items-center">
                <Button type="button" onClick={() => setActiveStep("bio")} variant={"secondary"}>
                    Back
                </Button>
                <Button type='submit' form='guardians-form' disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : undefined}
                    <span>Submit</span>
                </Button>
            </div>
        </div>
    )
}