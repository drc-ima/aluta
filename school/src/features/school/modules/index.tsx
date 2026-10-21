import { useParams } from "react-router-dom"
import StaffPage from "./staff"

export default function ModulePage(){
    const { moduleSlug } = useParams()
    return (
        moduleSlug === "staff" ? <StaffPage /> : <></>
    )
}