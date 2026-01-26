'use client'

import { useState } from 'react'
import { Task, Goal } from '@/lib/types'
import { saveTask, updateTask, deleteTask } from '@/lib/storage'
import { getGoals, saveGoal, updateGoal, deleteGoal } from '@/lib/goals-storage'
import { CheckSquare, Plus, Trash2, Calendar as CalendarIcon, Target, Clock, AlertCircle } from 'lucide-react'

interface TasksExpandedProps {
  tasks: Task[]
  goals: Goal[]
  onTasksChanged: () => void
  onGoalsChanged: () => void
  userPlan: 'gratuito' | 'premium' | 'pro'
}

export function TasksExpanded({ tasks, goals, onTasksChanged, onGoalsChanged, userPlan }: TasksExpandedProps) {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskType, setTaskType] = useState<'curto_prazo' | 'longo_prazo'>('curto_prazo')
  const [taskDeadline, setTaskDeadline] = useState('')
  const [taskPriority, setTaskPriority] = useState<'baixa' | 'media' | 'alta'>('media')
  
  const [goalTitle, setGoalTitle] = useState('')
  const [goalType, setGoalType] = useState<'curto_prazo' | 'longo_prazo'>('curto_prazo')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [goalDescription, setGoalDescription] = useState('')

  const hasAccess = userPlan === 'premium' || userPlan === 'pro'

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      completed: false,
      date: new Date().toISOString(),
      type: taskType,
      deadline: taskDeadline || undefined,
      priority: taskPriority,
      status: 'pendente',
    }

    saveTask(task)
    setTaskTitle('')
    setTaskDeadline('')
    setShowTaskForm(false)
    onTasksChanged()
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: goalTitle.trim(),
      type: goalType,
      deadline: goalDeadline || undefined,
      progress: 0,
      description: goalDescription.trim() || undefined,
    }

    saveGoal(goal)
    setGoalTitle('')
    setGoalDeadline('')
    setGoalDescription('')
    setShowGoalForm(false)
    onGoalsChanged()
  }

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      updateTask(id, { 
        completed: !task.completed,
        status: !task.completed ? 'concluida' : 'pendente'
      })
      onTasksChanged()
    }
  }

  const handleDeleteTask = (id: string) => {
    if (confirm('Deseja remover esta tarefa?')) {
      deleteTask(id)
      onTasksChanged()
    }
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm('Deseja remover esta meta?')) {
      deleteGoal(id)
      onGoalsChanged()
    }
  }

  const handleUpdateGoalProgress = (id: string, progress: number) => {
    updateGoal(id, { progress })
    onGoalsChanged()
  }

  const shortTermTasks = tasks.filter(t => t.type === 'curto_prazo')
  const longTermTasks = tasks.filter(t => t.type === 'longo_prazo')
  const shortTermGoals = goals.filter(g => g.type === 'curto_prazo')
  const longTermGoals = goals.filter(g => g.type === 'longo_prazo')

  // Verificar tarefas vencidas
  const overdueTasks = tasks.filter(t => {
    if (!t.deadline || t.completed) return false
    return new Date(t.deadline) < new Date()
  })

  if (!hasAccess) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
        <Target className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
          Tarefas e Metas Avançadas
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
          Disponível nos planos Premium e Pro
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas de tarefas vencidas */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="font-semibold text-red-900 dark:text-red-100">
              {overdueTasks.length} {overdueTasks.length === 1 ? 'tarefa vencida' : 'tarefas vencidas'}
            </p>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            Você tem tarefas que passaram do prazo. Revise sua lista!
          </p>
        </div>
      )}

      {/* Seção de Tarefas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tarefas</h2>
          </div>
          {!showTaskForm && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova tarefa
            </button>
          )}
        </div>

        {showTaskForm && (
          <form onSubmit={handleAddTask} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Título da tarefa"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="curto_prazo">Curto prazo</option>
                <option value="longo_prazo">Longo prazo</option>
              </select>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="baixa">Prioridade baixa</option>
                <option value="media">Prioridade média</option>
                <option value="alta">Prioridade alta</option>
              </select>
            </div>
            <input
              type="date"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTaskForm(false)
                  setTaskTitle('')
                  setTaskDeadline('')
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Tarefas de curto prazo */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Curto prazo
          </h3>
          {shortTermTasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma tarefa de curto prazo</p>
          ) : (
            <div className="space-y-2">
              {shortTermTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {task.deadline && (
                        <span className={new Date(task.deadline) < new Date() && !task.completed ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                          📅 {new Date(task.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full ${
                        task.priority === 'alta' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                        task.priority === 'media' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {task.priority === 'alta' ? 'Alta' : task.priority === 'media' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarefas de longo prazo */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Longo prazo
          </h3>
          {longTermTasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma tarefa de longo prazo</p>
          ) : (
            <div className="space-y-2">
              {longTermTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {task.deadline && (
                        <span className={new Date(task.deadline) < new Date() && !task.completed ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                          📅 {new Date(task.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full ${
                        task.priority === 'alta' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                        task.priority === 'media' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {task.priority === 'alta' ? 'Alta' : task.priority === 'media' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Metas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Metas</h2>
          </div>
          {!showGoalForm && (
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova meta
            </button>
          )}
        </div>

        {showGoalForm && (
          <form onSubmit={handleAddGoal} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Título da meta"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="curto_prazo">Curto prazo</option>
              <option value="longo_prazo">Longo prazo</option>
            </select>
            <input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              placeholder="Prazo (opcional)"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium">
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGoalForm(false)
                  setGoalTitle('')
                  setGoalDeadline('')
                  setGoalDescription('')
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Metas de curto prazo */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Curto prazo</h3>
          {shortTermGoals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma meta de curto prazo. Crie sua primeira meta!</p>
          ) : (
            <div className="space-y-3">
              {shortTermGoals.map(goal => (
                <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                      )}
                      {goal.deadline && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📅 Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleUpdateGoalProgress(goal.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metas de longo prazo */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Longo prazo</h3>
          {longTermGoals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma meta de longo prazo</p>
          ) : (
            <div className="space-y-3">
              {longTermGoals.map(goal => (
                <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                      )}
                      {goal.deadline && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📅 Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleUpdateGoalProgress(goal.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
