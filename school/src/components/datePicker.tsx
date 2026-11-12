import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toDateString } from '@/libs/utils'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date| undefined) => void
  placeholder?: string,
  disabled?: boolean,
  minDate?: Date,
  maxDate?: Date
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  disabled,
  minDate,
  maxDate
}: DatePickerProps) {
  const _min = minDate || new Date('1900-01-01')

  const selectedDateString = toDateString(selected)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant='outline'
          data-empty={!selected}
          className='w-full justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
        >
          {selected ? (
            format(selected, 'MMM d, yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected ? new Date(`${selectedDateString}T12:00:00`) : undefined}
          onSelect={(selectedDate) => {
            // const date = toDateString(selectedDate)
            onSelect(selectedDate)
          }}
          // onSelect={onSelect}
          disabled={maxDate !== undefined ? { before: _min, after: maxDate}: {before: _min}}
          // disabled={(date: Date) => {
          //   if (maxDate) {
          //     return date > _min || date < maxDate
          //   } else {
          //     return date < _min
          //   }
          // }}
        // date > new Date() || date < new Date('1900-01-01')
        />
      </PopoverContent>
    </Popover>
  )
}
