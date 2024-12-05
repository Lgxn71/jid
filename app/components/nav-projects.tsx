import { Form, Link, useLocation, useParams } from '@remix-run/react';
import { Frame, MoreHorizontal, PlusSquare } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Project } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { parse } from 'superjson';

export function NavProjects({ className }: React.ComponentProps<'ul'>) {
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      fetch(`http://${window.location.host}/api/organization/${params.id}`)
        .then(res => res.json())
        .then(data => parse(data.projects))
  }) as { data: Project[] };

  const params = useParams();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <ul className={cn('grid gap-0.5', className)}>
        {projects?.length > 0 &&
          projects?.map(item => (
            <li
              key={item.id}
              className={cn(
                'has-[[data-state=open]]:bg-accent has-[[data-state=open]]:text-accent-foreground group relative rounded-md hover:bg-accent hover:text-accent-foreground',
                {
                  'bg-secondary': location.pathname.includes(`p/${item.id}`)
                }
              )}
            >
              <Link
                to={
                  location.pathname.includes('/p/')
                    ? location.pathname.replace(/(?<=\/p\/)[^\/]+/, item.id)
                    : `p/${item.id}`
                }
                className="flex h-7 items-center gap-2.5 overflow-hidden rounded-md px-1.5 text-xs outline-none ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
              >
                <Frame className="h-4 w-4 shrink-0 translate-x-0.5 text-muted-foreground" />
                <div className="line-clamp-1 grow overflow-hidden pr-6 font-medium">
                  {item.name}
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="peer absolute right-1 top-0.5 h-6 w-6 shrink-0 rounded-md bg-accent p-0 text-accent-foreground opacity-0 ring-ring transition-all focus-visible:ring-2 group-focus-within:opacity-100 group-hover:opacity-100 data-[state=open]:bg-accent data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={20}>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        <li>
          <button
            type="button"
            className="flex h-7 w-full items-center gap-2.5 overflow-hidden rounded-md px-1.5 text-left text-xs ring-ring transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2"
          >
            <PlusSquare className="h-4 w-4 shrink-0 translate-x-0.5 text-muted-foreground" />
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="line-clamp-1 overflow-hidden font-medium text-muted-foreground"
              onClick={() => setOpen(true)}
            >
              Add Project
            </div>
          </button>
        </li>
      </ul>
      <Dialog open={open} onOpenChange={val => setOpen(val)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a new project</DialogTitle>
          </DialogHeader>
          <Form
            method="POST"
            navigate={false}
            action={`/api/project/${params.id}`}
            className="grid gap-4 py-4"
            onSubmit={() => setOpen(false)}
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue="New project"
                className="col-span-3"
              />
            </div>
            <Input name="intent" value="CREATE_PROJECT" className="hidden" />
            <Button type="submit">Save changes</Button>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
