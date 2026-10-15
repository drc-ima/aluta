import { useUserSchools } from "../hooks"

export default function SchoolSelector() {

    const schools = useUserSchools();
    return <>{JSON.stringify(schools.data)}</>
}