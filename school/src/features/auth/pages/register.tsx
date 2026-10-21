import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import SchoolDetailsStep from "../components/steps/schoolDetailsStep";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { RegisterPayload } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { CheckIcon, Loader2, Loader2Icon, MapPinHouseIcon, PlusCircleIcon, SchoolIcon, SearchIcon, UserIcon, XIcon, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useRegisterSchool, useSchoolAddress } from "@/features/school/hooks";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/ui/passwordInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    creator: z.object({
        first_name: z.string({
            error: (iss) => (iss.input === "" ? "Please enter your first name" : undefined)
        }),
        last_name: z.string().trim().min(1, "Last name is required."),
        middle_name: z.string().optional(),
        phone: z.string().optional(),
        email: z.email({
            error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
        }),
        password: z
            .string()
            .min(1, 'Please enter your password.')
            .min(7, 'Password must be at least 7 characters long.'),
    }),
    campus: z.object({
        name: z.string().trim().min(1, "Enter the name of your main location"),
        address: z.record(z.string(), z.any()).readonly().optional(),
        addressStr: z.string().trim().min(1, "Please click on the search to populate the address field."),
        gps_code: z.string().trim().min(1, "Please enter a valid Ghana Post GPS Address"),
        contacts: z.array(z.object({ 
            contact_type: z.string().trim().min(1, "Select contact type"), 
            contact: z.string().trim().min(1, "Enter contact details.")
        }))
    }),
    school: z.object({
        name: z.string().trim().min(1, "School name is required."),
        business_email: z.email(),
        website: z.url()
    }),

})
export default function Register() {
    const navigate = useNavigate()
    const data = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            school: {
                name: "Seven Great Princess Academy",
                business_email: "info@sgpa.com",
                website: "http://sgpa.com"
            },
            campus: {
                name: "Kasoa Campus",
                gps_code: "CG-0461-0872",
                address: undefined,
                addressStr: "",
                contacts: [{
                    contact_type: "PHONE",
                    contact: "0201234567"
                }]
            },
            creator: {
                first_name: "Samuel",
                last_name: "Kissi",
                middle_name: "",
                email: "sammy@gmail.com",
                phone: "0201234567",
                password: "mypassword1"
            }
        }
    })

    const searchAddressMutation = useSchoolAddress();
    const registerSchoolMutation = useRegisterSchool();

    const onSearchAddress = async (gpsCode: string) => {
        searchAddressMutation.mutate({ gps_code: gpsCode }, {
            onError: (error) => {
                console.log(error.message)
                toast.error(JSON.parse(error.message).detail)
            },
            onSuccess: (deta) => {
    
                const addr = `${deta.Table[0].Area ? deta.Table[0].Area + ", " : ""}${deta.Table[0].District ? deta.Table[0].District + ", " : ""}${deta.Table[0].Region ? deta.Table[0].Region : ""}`
                data.setValue("campus.addressStr", addr)
                data.setValue("campus.address", deta.Table[0])
                
            },
        })
    }

    const onSubmit = async (data: RegisterPayload | any) => {
       registerSchoolMutation.mutate({
        ...data,
        campus: {
            ...data.campus,
            address: JSON.stringify(data.campus.address)
        }
    }, {
        onSuccess: (_) => {
            toast.success("New school registered successfully. Check your business email and personal email to complete the verification process.")
            navigate("/")
        },
        onError: (error) => {
            console.log(error.message)
            toast.error(JSON.parse(error.message).detail)
        }
       })
    };

    
    return (
        <React.Fragment>

            <div className="flex flex-col gap-[1rem] w-full! h-full">
                <div className='flex w-full flex-col justify-center py-8 sm:w-120 sm:p-8'>
                    <div className='flex items-center justify-center gap-1'>
                        <img src="/favicon-32x32.png" />
                        <h1 className='text-2xl font-medium font-bold!'>Aluta Schools</h1>
                    </div>
                </div>
                <div className="flex flex-col gap-[1rem] text-start">
                    <h2 className='text-lg! font-semibold! tracking-tight'>Register your school.</h2>
                    <p>
                        Become a part of Aluta Schools by registering below. If you are already a member,{" "}
                        <Link
                            to='/'
                            className='text-nowrap underline underline-offset-4 hover:text-primary'
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
                <Form {...data}>
                    <form
                        className='flex flex-col gap-[1rem]'
                        onSubmit={data.handleSubmit(onSubmit)}
                    // onSubmit={nextStep}

                    >
                        <div className="font-semibold">
                            <h2>School Information</h2>
                            <hr />
                        </div>
                        <FormField
                            control={data.control}
                            name='school.name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>School Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder='Enter school name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={data.control}
                            name="school.business_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter business email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={data.control}
                            name="school.website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter website"
                                            {...field}
                                            type="url"

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={data.control}
                            name='campus.name'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Campus Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter name of your name location'
                                                {...field}

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={data.control}

                            name='campus.gps_code'
                            render={({ field }) => {

                                return (
                                    <div className="flex items-end gap-[1rem] mt-[1rem]">
                                        <FormItem className='flex-grow-1'>
                                            <FormLabel>Ghana Post GPS Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Enter the Ghana Post GPS Address Code of your school. '
                                                    {...field}

                                                />
                                            </FormControl>
                                            {/* <FormMessage /> */}
                                        </FormItem>
                                        <Button
                                            variant={"outline"}
                                            size={"icon"}
                                            type="button"
                                            disabled={field.value === ""}
                                            onClick={() => onSearchAddress(field.value)}

                                        >
                                            {searchAddressMutation.isPending ? <Loader2Icon className='animate-spin' /> : <SearchIcon />}
                                        </Button>
                                    </div>

                                )
                            }}
                        />

                        <FormField
                            control={data.control}
                            name='campus.addressStr'
                            render={({ field }) => {
                                // field.value = addressStr
                                return (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Address will be populated from your GPS Address'
                                                {...field}


                                                disabled
                                                value={field.value ? field.value.toString() : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <ContactFields data={data} />
                        <div className="font-semibold">
                            <h2>Personal Information</h2>
                            <hr />
                        </div>
                        <FormField
                            control={data.control}
                            name='creator.first_name'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter your first name.'
                                                {...field}

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={data.control}
                            name='creator.middle_name'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Middle Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter your middle name.'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={data.control}
                            name='creator.last_name'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter your last name.'
                                                {...field}

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={data.control}
                            name='creator.email'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter your email address.'
                                                {...field}

                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={data.control}
                            name='creator.phone'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter your phone number'
                                                {...field}
                                                type="tel"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={data.control}
                            name='creator.password'
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder='Enter a password for your account login' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        /><Button
                                variant={"default"}
                                type="submit"
                                disabled={registerSchoolMutation.isPending}
                            >
                                {registerSchoolMutation.isPending ? <Loader2 className='animate-spin' /> : undefined}
                                Submit
                            </Button>
                        <div className="flex justify-end items-center mb-[1rem]!">

                            
                        </div>
                    </form>

                </Form>
            </div>
        </React.Fragment>
    )
}

const ContactFields = ({ data }: { data: UseFormReturn<RegisterPayload> | any }) => {
    const { fields, append, remove } = useFieldArray({
        control: data.control,
        name: "campus.contacts",
    });

    return (
        <div>
            {fields.map((_, index) => (
                <div className="flex items-end gap-[1rem] mb-[1rem]" key={index}>
                    <FormField
                    
                        control={data.control}
                        name={`campus.contacts.${index}.contact_type`}
                        render={({ field }) => {
                            
                            return (
                                <FormItem className="">
                                    <FormLabel>Email</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select type' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='EMAIL'>Email Address</SelectItem>
                                            <SelectItem value='PHONE'>Phone Number</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <FormField

                        control={data.control}
                        name={`campus.contacts.${index}.contact`}
                        render={({ field }) => (
                            <FormItem className="w-[50%]">
                                <FormLabel>Contact</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter contact information"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />

                            </FormItem>
                        )}
                    />
                    <Button type="button" size={"icon"} variant={"destructive"} onClick={() => {
                        if(index === 0){
                            toast.error("Please add at least one contact of for the location.")
                            return
                        }
                    
                        remove(index)
                    }}>
                        <XIcon />
                    </Button>
                </div>

            ))}

            <Button
                type="button"
                className="mt-[1rem]"
                // size={"icon"}
                variant={"secondary"}
                onClick={() => append({ contact: "", contact_type: "" })}
            >
                <PlusCircleIcon /> Add Contact
            </Button>
        </div>
    );
};