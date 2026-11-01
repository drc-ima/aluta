export type AcademicPeriodT = {
    school_id: string
    name: string
    start_date: Date
    weeks: number
    days: number
    today_year: boolean
    today_term: boolean
    end_date: Date
    parent_id: string | null
    campus_id: string
    id: string
    created_at: Date
    updated_at: Date
    created_by_id: string
    updated_by_id: string
    children: AcademicPeriodT[]
}

export type AcademicPeriodPayload = {
    name: string
    start_date: string
    end_date: string
    parent_id: string | null
} & BodyInit