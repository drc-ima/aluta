import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { RegisterPayload } from "../../api";
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PlusCircleIcon, SearchIcon, XIcon } from "lucide-react";
import { useSchoolAddress } from "@/features/school/hooks";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";


const CampusDetailsStep = ({ data }: { data: UseFormReturn<RegisterPayload> | any }) => {
    
    return (
        <React.Fragment>
            <p className="text-center">If your school has multiple campus, you will be able to add the rest after registering.</p>
            
            <ContactFields data={data} />
        </React.Fragment>
    )
}




export default CampusDetailsStep