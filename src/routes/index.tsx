import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { EditIcon, ListTodoIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '#/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/utils'
import { ActionButton } from '#/components/ui/action-button'
import z from 'zod'
import { todos } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { startTransition, useState } from 'react'
import { LocalCountButton } from '#/components/LocalCountButton'

const serverLoader = createServerFn({ method: 'GET' }).handler(async () => {
  return db.query.todos.findMany()
})

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => {
    return await serverLoader()
  }
})

function App() {

  const todos = Route.useLoaderData()
  const completedCount = todos.filter((todo) => todo.isCompleted).length
  const totalCount = todos.length

  return (
    <div className='"h-screen container space-y-8'>
      <div className='flex justify-between items-center gap-4'>
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold'>Todo list</h1>
          {totalCount > 0 && (
            <Badge variant="ghost">
              {completedCount} of {totalCount} completed
            </Badge>
          )}
        </div>
        <div className='flex gap-2'>
          <LocalCountButton />
          <Button asChild size={'sm'}>
            <Link to="/todos/new">
              <PlusIcon className='size-4' />
              New Todo
            </Link>
          </Button>
        </div>
      </div>

      <TodoListTable todos={todos}></TodoListTable>
    </div>
  )
}

function TodoListTable({ todos }: {
  todos: Array<{
    id: string
    name: string
    isCompleted: boolean
    createdAt: Date
  }>
}) {

  if (todos.length === 0) {
    return (
      <Empty className='border border-dashed'>
        <EmptyHeader>
          <EmptyMedia variant={'icon'}>
            <ListTodoIcon />
          </EmptyMedia>
          <EmptyTitle>No todos found</EmptyTitle>
          <EmptyDescription>
            <p>
              You don't have any todos yet. Create one to get started.
            </p>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/todos/new">
              <PlusIcon className='size-4' />
              Add Todo
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader className='bg-muted'>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Completed</TableHead>
          <TableHead>Created On</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.map((todo) => (
          <TodoTableRow key={todo.id} todo={todo} />
        ))}
      </TableBody>
    </Table>
  )
}

const deleteFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string().min(1),
  })).handler(async ({ data }) => {
    await db.delete(todos).where(eq(todos.id, data.id))

    // throw redirect({ to: "/" })
    return { error: true }

  })


const toggleFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string().min(1),
    isCompleted: z.boolean(),
  })).handler(async ({ data }) => {
    await new Promise((res) => setTimeout(res, 1000))
    await db.update(todos)
      .set({ isCompleted: data.isCompleted })
      .where(eq(todos.id, data.id))

    // throw redirect({ to: "/" })
    return { error: true }

  })

function TodoTableRow({ todo }: {
  todo: {
    id: string
    name: string
    isCompleted: boolean
    createdAt: Date
  }
}) {
  const deleteTodoFn = useServerFn(deleteFn)
  const toggleTodoFn = useServerFn(toggleFn)
  const [isCurrentComplete, setIsCurrentComplete] = useState(todo.isCompleted)
  const router = useRouter()

  return (
    <TableRow onClick={(e) => {
      const target = e.target as HTMLElement
      if (target.closest("[data-actions]")) return

      setIsCurrentComplete(!isCurrentComplete)
      startTransition(async () => {
        await toggleTodoFn({ data: { id: todo.id, isCompleted: !todo.isCompleted } })
        router.invalidate()
      })
    }}>

      <TableCell>
        <Checkbox
          checked={isCurrentComplete}
          className='border border-black'
          onCheckedChange={() => { }} />
      </TableCell>
      <TableCell
        className={cn('font-medium', isCurrentComplete && 'text-muted-foreground  line-through')}>{todo.name}</TableCell>
      <TableCell>{todo.isCompleted ? 'Yes' : 'No'}</TableCell>
      <TableCell>{todo.createdAt.toLocaleDateString()}</TableCell>
      <TableCell data-actions>
        <Button variant='ghost' size='icon-sm' asChild>
          <Link to="/todos/$id/edit" params={{ id: todo.id }}>
            <EditIcon className='size-4' />
          </Link>
        </Button>
        <ActionButton variant='ghost' size='icon-sm'
          action={async () => {
            const res = await deleteTodoFn({ data: { id: todo.id } })
            router.invalidate()
            return res
          }}>
          <TrashIcon className='size-4 text-destructive' />
        </ActionButton>
      </TableCell>
    </TableRow>
  )
}