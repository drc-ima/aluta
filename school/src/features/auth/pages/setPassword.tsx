import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/passwordInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    password1: z
        .string()
        .min(1, 'Please enter new password.')
        .min(7, 'Password must be at least 7 characters long.'),
    password2: z
        .string()
        .min(1, 'Please confirm your password.')
        .min(7, 'Password must be at least 7 characters long.')
        
}).refine((data) => data.password1 === data.password2, {
  message: "Passwords do not match",
  path: ["password2"],
});

type SetPasswordForm = z.infer<typeof formSchema>

export default function SetPassword() {
    const form = useForm<SetPasswordForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password1: "",
            password2: ""
        }
    })

    const handleSubmit = (data: SetPasswordForm) => {

    }
    return (
        <div className='w-full h-full flex flex-col gap-[1rem] justify-center'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
                <div className='mb-4 flex items-center justify-center gap-1'>
                    <img src="/favicon-32x32.png" />
                    <h1 className='text-2xl font-medium font-bold!'>Aluta Schools</h1>
                </div>
            </div>
            <div className='flex flex-col gap-[1rem] text-start'>
                <h2 className='text-lg! font-semibold! tracking-tight'>Create New Password?</h2>
                
            </div>
            <Form
                {...form}
            >
                <form
                    id="set-password"
                    className='flex flex-col gap-[1rem]'
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <FormField
                        control={form.control}
                        name='password1'
                        render={({ field }) => (
                            <FormItem className='mt-[1rem]'>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <PasswordInput 
                                    placeholder='username@school.com' 
                                    {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='password2'
                        render={({ field }) => (
                            <FormItem className='mt-[1rem]'>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <PasswordInput 
                                    placeholder='username@school.com' 
                                    {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <Button type="submit" form="set-password" className='mt-2' disabled={false}>
                {/* {isPending && <Loader2 className='animate-spin' />} */}
                Submit
            </Button>
        </div>
    )
}
