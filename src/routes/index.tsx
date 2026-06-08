import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { EditIcon, ListTodoIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '#/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/utils'

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
        <div>
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

function TodoTableRow({ todo }: {
  todo: {
    id: string
    name: string
    isCompleted: boolean
    createdAt: Date
  }
}) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={todo.isCompleted}
          className='border border-black'
          onCheckedChange={() => { }} />
      </TableCell>
      <TableCell
        className={cn('font-medium', todo.isCompleted && 'text-muted-foreground  line-through')}>{todo.name}</TableCell>
      <TableCell>{todo.isCompleted ? 'Yes' : 'No'}</TableCell>
      <TableCell>{todo.createdAt.toLocaleDateString()}</TableCell>
      <TableCell>
        <Button variant='ghost' size='icon-sm' asChild>
          <Link to="/todos/$id/edit" params={{ id: todo.id }}>
            <EditIcon className='size-4' />
          </Link>
        </Button>
        <Button variant='ghost' size='icon-sm'>
          <TrashIcon className='size-4 text-destructive' />
        </Button>
      </TableCell>
    </TableRow>
  )
}