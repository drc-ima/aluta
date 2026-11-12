import { useEffect, useRef, useState } from "react"
import { Label } from "./ui/label"
import { ImageIcon, Trash2Icon, UploadCloudIcon } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { cn } from "@/libs/utils"

interface ProfileUploadProps {
    file: File | null,
    handleChange: (file: File | null) => void,
    required?: boolean,
    name?: string
}
const ProfileUploader: React.FC<ProfileUploadProps> = ({ file, handleChange, required, name }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isValid, setIsValid] = useState<boolean>(true)

    useEffect(() => {
        if (!file) {
            const t = window.setTimeout(() => setPreview(null), 0)

            return () => clearTimeout(t)
        }

        const url = URL.createObjectURL(file)

        const t = window.setTimeout(() => setPreview(url), 0)

        return () => {
            clearTimeout(t)
            URL.revokeObjectURL(url)
        }
    }, [file])

    const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        const v = e.target.value
        console.log(v, f)
        if (!f) return

        if (!f.type.startsWith('image/')) {
            toast.error('Please select an image file')
            e.currentTarget.value = ''

            return
        }

        if (f.size > 1024 * 1024) {
            toast.error('File must be smaller than 1MB')
            e.currentTarget.value = ''

            return
        }

        handleChange(f)
    }

    const openPicker = () => inputRef.current?.click()

    const remove = () => {
        handleChange(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className='space-y-2'>
            <Label>Student Avatar</Label>
            <div className='flex items-center gap-4'>
                <div
                    role='button'
                    tabIndex={0}
                    aria-label='Upload your avatar'
                    onClick={openPicker}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openPicker()
                        }
                    }}
                    className='flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed hover:opacity-95'
                >
                    {preview ? (
                        <img src={preview} alt='avatar preview' className='h-full w-full object-cover' />
                    ) : (
                        <ImageIcon />
                    )}
                </div>

                <div className='flex items-center gap-2'>
                    <input
                        name={name}
                        ref={inputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        required={required}
                        // value={`C:\\fakepath\\${file?.name}`}
                        onChange={onSelect}
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.setCustomValidity("")
                            // setIsValid(true)
                        }}
                        onInvalid={(e) => {
                            e.preventDefault()
                            console.log(e.target)
                            setIsValid(false)
                        }}
                    />
                    <Button type='button' variant='outline' onClick={openPicker} className='flex items-center gap-2'>
                        <UploadCloudIcon />
                        Upload avatar
                    </Button>
                    <Button type='button' variant='ghost' onClick={remove} disabled={!file} className='text-destructive!'>
                        <Trash2Icon />
                    </Button>
                </div>
            </div>
            <p
                className={
                    cn(
                        'text-muted-foreground text-xs',
                        !isValid ? "text-destructive!" : ""
                    )
                }
            >
                Pick a photo up to 1MB.
            </p>
        </div>
    )
}

export default ProfileUploader