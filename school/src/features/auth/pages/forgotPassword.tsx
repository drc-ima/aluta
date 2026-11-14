import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useForgotPassword } from "../hooks";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
    username: z.email({
        error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
    }),
})

type ForgotPasswordForm = z.infer<typeof formSchema>

export default function ForgotPassword() {
    const form = useForm<ForgotPasswordForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: ""
        }
    })
    const navigate = useNavigate()

    const {
        isPending,
        mutate
    } = useForgotPassword()

    const handleSubmit = (data: ForgotPasswordForm | any) => {
        mutate(
            {
                ...data
            }, {
            onError: (error) => {
                console.log(error)
                toast.error(JSON.parse(error.message).detail)
            },
            onSuccess: () => {
                toast.success(`We have sent a set password link to your email. Please continue from there.`)
                navigate("/")
            },
        }
        )
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
                <h2 className='text-lg! font-semibold! tracking-tight'>Forgot Password?</h2>
                <p className='text-sm! text-muted-foreground'>
                    Enter your email to continue{' '}
                    <br className='max-sm:hidden' /> If you have all of a sudden remembered your password {' '}
                    <Link
                        to='/'
                        className='text-nowrap underline underline-offset-4 hover:text-primary'
                    >
                        Login
                    </Link>
                </p>
            </div>
            <Form
                {...form}
            >
                <form
                    id="forgot-password"
                    className='flex flex-col gap-[1rem]'
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <FormField
                        control={form.control}
                        name='username'
                        render={({ field }) => (
                            <FormItem className='mt-[1rem]'>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder='username@school.com' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <Button type="submit" form="forgot-password" className='mt-2' disabled={isPending}>
                {isPending && <Loader2 className='animate-spin' />}
                Continue
            </Button>
        </div>
    )
}