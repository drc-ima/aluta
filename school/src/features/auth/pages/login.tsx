import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/passwordInput'
import { NO_AUTH_ROUTES, useAuth } from '@/contexts/authProvider'

import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks'
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import type { LoginPayload } from '../api'


const formSchema = z.object({
    username: z.email({
        error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
    }),
    password: z
        .string()
        .min(1, 'Please enter your password.')
        .min(7, 'Password must be at least 7 characters long.'),
})
export default function Login() {

    const { redirectTo } = useAuth();

    const loginMutation = useLogin();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const onSubmit = async (
        data: LoginPayload | { username: string, password: string },
    ) => {
        
        loginMutation.mutate(data, {
            onError: (error) => {
                console.log(error)
                toast.error(JSON.parse(error.message).detail)
            },
            onSuccess: (deta) => {
                toast.success(`Welcome back ${data.username}!`)
                localStorage.setItem("aluta_sess", deta.access_token)
                console.log(NO_AUTH_ROUTES.includes(redirectTo), redirectTo)
                window.location.replace("/dashboard")
            },
        })

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
                <h2 className='text-lg! font-semibold! tracking-tight'>Sign in</h2>
                <p className='text-sm! text-muted-foreground'>
                    Enter your email and password below to log into{' '}
                    <br className='max-sm:hidden' /> your school account.If your should is not registered yet {' '}
                    <Link
                        to='/register'
                        className='text-nowrap underline underline-offset-4 hover:text-primary'
                    >
                        Register
                    </Link>
                </p>
            </div>
            <Form 
                {...form}

            >
                <form
                    
                    className='flex flex-col gap-[1rem]'
                    onSubmit={form.handleSubmit(onSubmit)}

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
                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem className='relative'>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <PasswordInput placeholder='********' {...field} />
                                </FormControl>
                                <FormMessage />
                                <Link
                                    to='/forgot-password'
                                    className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
                                >
                                    Forgot password?
                                </Link>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className='mt-2' disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? <Loader2 className='animate-spin' /> : <LogIn />}
                        Sign in
                    </Button>
                </form>

            </Form>
            <p className='px-8 text-center text-sm text-muted-foreground'>
                By clicking sign in, you agree to our{' '}
                <a
                    href='/terms'
                    className='underline underline-offset-4 hover:text-primary'
                >
                    Terms of Service
                </a>{' '}
                and{' '}
                <a
                    href='/privacy'
                    className='underline underline-offset-4 hover:text-primary'
                >
                    Privacy Policy
                </a>
                .
            </p>
        </div>
    )
}
