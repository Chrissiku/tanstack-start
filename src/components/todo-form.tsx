import { type FormEvent, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LoadingSwap } from "./ui/loading-swap";
import { PencilIcon, PlusIcon } from "lucide-react";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";


const addTodo = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        name: z.string().min(1),
    })).handler(async ({ data }) => {
        await db.insert(todos).values({
            ...data,
            isCompleted: false,
        })

        throw redirect({ to: "/" })
    })


const updateTodo = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
    })).handler(async ({ data }) => {
        await db.update(todos).set(data
        ).where(eq(todos.id, data.id))

        throw redirect({ to: "/" })
    })


export default function TodoForm({ todo }: { todo?: { id: string, name: string } }) {
    const nameRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const addTodoFn = useServerFn(addTodo)
    const updateTodoFn = useServerFn(updateTodo)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        const name = nameRef.current?.value
        if (!name) return
        setIsLoading(true)


        if (todo) {
            await updateTodoFn({ data: { id: todo.id, name } })
        } else {
            await addTodoFn({ data: { name } })
        }

        setIsLoading(false)
        nameRef.current!.value = ""
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                autoFocus
                ref={nameRef}
                placeholder="Add a new todo"
                className="flex-1"
                aria-label="Name"
                defaultValue={todo?.name}
            />
            <Button type="submit" disabled={isLoading} aria-label="Add todo">
                <LoadingSwap isLoading={isLoading} className="flex gap-2 items-center">
                    {todo ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />} {todo ? 'Update' : 'Add'}
                </LoadingSwap>
            </Button>
        </form>
    )
}
