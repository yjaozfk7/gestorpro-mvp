'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { saveTask, updateTask, deleteTask } from '@/lib/storage'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onTasksChanged: () => void
}

export function TaskList({ tasks, onTasksChanged }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.date === today)
  const completedCount = todayTasks.filter(t => t.completed).length

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      date: today,
    }

    saveTask(task)
    setNewTaskTitle('')
    onTasksChanged()
  }

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTask(id, { completed: !completed })
    onTasksChanged()
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
    onTasksChanged()
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Tarefas de hoje
        </h2>
        {todayTasks.length > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} de {todayTasks.length} concluídas
          </span>
        )}
      </div>

      {/* Formulário de nova tarefa */}
      <form onSubmit={handleAddTask} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Adicionar nova tarefa..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Lista de tarefas */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Adicione sua primeira tarefa do dia.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Use o campo acima para organizar suas atividades.
            </p>
          </div>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <button
                onClick={() => handleToggleTask(task.id, task.completed)}
                className="flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                )}
              </button>
              <span
                className={`flex-1 ${
                  task.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
