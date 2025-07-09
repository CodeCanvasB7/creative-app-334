
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, GripVertical, Trash2, Book, AlertTriangle, ChevronsUp, ChevronUp, Minus, Search, X } from 'lucide-react';

const CATEGORIES = ["Math", "Science", "History", "English", "Art", "Lab Report"];
const PRIORITIES = {
    High: { label: "High", color: "bg-rose-500", icon: <ChevronsUp className="h-4 w-4" /> },
    Medium: { label: "Medium", color: "bg-amber-500", icon: <ChevronUp className="h-4 w-4" /> },
    Low: { label: "Low", color: "bg-emerald-500", icon: <Minus className="h-4 w-4" /> }
};

const StudentTodoApp = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Complete Algebra II homework", category: "Math", priority: "High", completed: false, dueDate: "2023-10-27" },
        { id: 2, text: "Study for Biology midterm", category: "Science", priority: "High", completed: false, dueDate: "2023-10-29" },
        { id: 3, text: "Write essay on the Renaissance", category: "History", priority: "Medium", completed: true, dueDate: "2023-10-25" },
        { id: 4, text: "Read 'The Great Gatsby' Chapter 3", category: "English", priority: "Low", completed: false, dueDate: "2023-10-26" },
    ]);

    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskCategory, setNewTaskCategory] = useState(CATEGORIES[0]);
    const [newTaskPriority, setNewTaskPriority] = useState("Medium");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterPriority, setFilterPriority] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [draggedItem, setDraggedItem] = useState(null);

    const addTask = (e) => {
        e.preventDefault();
        if (newTaskText.trim() === "") return;
        const newTask = {
            id: Date.now(),
            text: newTaskText.trim(),
            category: newTaskCategory,
            priority: newTaskPriority,
            completed: false,
            dueDate: newTaskDueDate
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setNewTaskText("");
        setNewTaskDueDate("");
    };

    const toggleTask = useCallback((id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    const deleteTask = useCallback((id) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
            const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
            const matchesStatus = filterStatus === 'All' ||
                (filterStatus === 'Active' && !task.completed) ||
                (filterStatus === 'Completed' && task.completed);
            return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
        });
    }, [tasks, searchTerm, filterCategory, filterPriority, filterStatus]);

    const progress = useMemo(() => {
        const completedTasks = tasks.filter(t => t.completed).length;
        return tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    }, [tasks]);
    
    const handleDragStart = (e, task) => {
        setDraggedItem(task);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.parentNode);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetTask) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetTask.id) return;

        const currentIndex = tasks.findIndex(task => task.id === draggedItem.id);
        const targetIndex = tasks.findIndex(task => task.id === targetTask.id);

        const newTasks = [...tasks];
        const [removed] = newTasks.splice(currentIndex, 1);
        newTasks.splice(targetIndex, 0, removed);
        
        setTasks(newTasks);
        setDraggedItem(null);
    };

    const TaskItem = React.memo(({ task, onToggle, onDelete, onDragStart, onDragOver, onDrop }) => {
        const priorityInfo = PRIORITIES[task.priority];

        return (
            <div
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, task)}
                className={`flex items-center bg-white p-3 rounded-lg shadow-sm border-l-4 transition-all duration-300 group cursor-grab ${task.completed ? 'border-slate-300 opacity-60' : `border-${priorityInfo.color.split('-')[1]}-500`}`}
            >
                <GripVertical className="h-5 w-5 text-slate-300 mr-2 flex-shrink-0 transition-colors group-hover:text-slate-500" aria-hidden="true" />
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task.id)}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                    aria-labelledby={`task-text-${task.id}`}
                />
                <div className="flex-grow mx-4">
                    <p id={`task-text-${task.id}`} className={`text-slate-800 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.text}</p>
                    <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                        <span className="flex items-center"><Book className="h-3 w-3 mr-1" /> {task.category}</span>
                        {task.dueDate && <span>Due: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</span>}
                    </div>
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full text-white ${priorityInfo.color} mr-4 flex-shrink-0`}>
                    {priorityInfo.icon}
                    <span className="ml-1">{priorityInfo.label}</span>
                </div>
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 hover:text-rose-600 focus:opacity-100 focus:ring-2 focus:ring-rose-500"
                    aria-label={`Delete task: ${task.text}`}
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        );
    });

    return (
        <div className="bg-slate-800 min-h-screen font-sans p-4 sm:p-8 flex items-center justify-center bg-[url('data:image/svg+xml,%3Csvg%20width%3D%226%22%20height%3D%226%22%20viewBox%3D%220%200%206%206%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M5%200h1L0%206V5zM6%205v1H5z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
            <main className="w-full max-w-4xl bg-stone-50 rounded-2xl shadow-2xl overflow-hidden relative p-6 sm:p-8 md:p-10 transform transition-all duration-500">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-300"></div>
                <div className="absolute top-0 left-0 bottom-0 w-px bg-rose-400 ml-8"></div>

                <header className="mb-6 ml-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">My Assignments</h1>
                    <p className="text-slate-500 mt-1">Stay organized and ace your classes.</p>
                </header>

                <section className="mb-6 ml-8">
                    <h2 className="text-lg font-semibold text-slate-700 mb-2">Progress</h2>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                        <div
                            className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-right text-sm text-slate-600 mt-1">{Math.round(progress)}% Complete</p>
                </section>

                <section className="bg-slate-100 p-4 rounded-lg mb-6 ml-8 border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700 mb-3">Add New Task</h2>
                    <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="newTask" className="sr-only">New task description</label>
                            <input
                                id="newTask"
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="e.g., Finish chemistry lab report"
                                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                            <select id="category" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-slate-600 mb-1">Priority</label>
                            <select id="priority" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 mb-1">Due Date</label>
                            <input
                                id="dueDate"
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <button type="submit" className="md:col-start-2 flex items-center justify-center p-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300">
                            <Plus className="h-5 w-5 mr-2" /> Add Task
                        </button>
                    </form>
                </section>
                
                <section className="mb-6 ml-8">
                    <h2 className="text-lg font-semibold text-slate-700 mb-3">Your Tasks</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-100 border border-slate-200 rounded-lg mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                            <option value="All">All Subjects</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                            <option value="All">All Priorities</option>
                            {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="flex items-center justify-center bg-slate-200 rounded-md p-1">
                            {['All', 'Active', 'Completed'].map(status => (
                                <button key={status} onClick={() => setFilterStatus(status)} className={`w-full text-sm py-1 rounded-md transition-colors ${filterStatus === status ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:bg-slate-300'}`}>
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 px-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                                <AlertTriangle className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-lg font-medium text-slate-800">No tasks found</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {tasks.length === 0 ? "You haven't added any tasks yet. Get started above!" : "Try adjusting your filters to find what you're looking for."}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default StudentTodoApp;
