import TodoForm from '#/components/todo-form'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { db } from '#/db'
import { todos } from '#/db/schema'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { ArrowLeftIcon } from 'lucide-react'


const loaderFn = createServerFn({ method: "GET" })
    .inputValidator((data: { id: string }) => data)
    .handler(async ({ data }) => {
        const todo = await db.query.todos.findFirst({
            where: eq(todos.id, data.id)
        })


        if (todo == null) throw notFound()
        return todo
    })

export const Route = createFileRoute('/todos/$id/edit/')({
    component: RouteComponent,
    loader: ({ params }) => loaderFn({ data: { id: params.id } })
})

function RouteComponent() {
    const todo = Route.useLoaderData()

    return (
        <div className='container space-y-2'>
            <Button
                asChild
                variant={'ghost'}
                size="sm"
                className='text-muted-foreground'>

                <Link to="/">
                    <ArrowLeftIcon className='size-4' />Todo List</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Todo - {todo.name}</CardTitle>
                    <CardDescription>
                        Edit the task to update your todo list
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TodoForm todo={todo} />
                </CardContent>
            </Card>
        </div>
    )
}
