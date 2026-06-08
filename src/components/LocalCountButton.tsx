import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { createClientOnlyFn } from "@tanstack/react-start"
import { ClientOnly } from "@tanstack/react-router"

export function LocalCountButton() {
    return (
        <ClientOnly>
            <ClientSection />
        </ClientOnly>
    )
}


function ClientSection() {
    const [count, setCount] = useState(loadCountFn)


    useEffect(() => {
        localStorage.setItem("count", count.toString())
    }, [count])

    return (

        <Button variant='default' size='sm' onClick={() => setCount(count + 1)}>
            {count}
        </Button>

    )
}

const loadCountFn = createClientOnlyFn(() => {
    const savedCount = localStorage.getItem("count")
    return savedCount ? parseInt(savedCount) : 0
})