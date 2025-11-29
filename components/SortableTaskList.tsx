'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import SortableTaskRow from './SortableTaskRow';
import AddTaskRow from './AddTaskRow';

interface SortableTaskListProps {
  projectId: string;
  tasks: Task[];
}

export default function SortableTaskList({ projectId, tasks }: SortableTaskListProps) {
  const { reorderTasks } = useProjectStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderTasks(projectId, active.id as string, over.id as string);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <SortableTaskRow key={task.id} projectId={projectId} task={task} />
          ))}
          {/* タスク追加行 */}
          <AddTaskRow projectId={projectId} />
        </div>
      </SortableContext>
    </DndContext>
  );
}

