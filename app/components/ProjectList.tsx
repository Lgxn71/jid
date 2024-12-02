import { useMessageRead } from '~/contexts/MessageReadContext'

export function ProjectList({ projects }: { projects: Project[] }) {
  const { getUnreadCount } = useMessageRead()

  return (
    <div>
      {projects.map((project) => (
        <Link 
          key={project.id} 
          to={`/projects/${project.id}`}
          className="flex items-center justify-between p-2 hover:bg-gray-100"
        >
          <span>{project.name}</span>
          {getUnreadCount(project.id) > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {getUnreadCount(project.id)}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
} 