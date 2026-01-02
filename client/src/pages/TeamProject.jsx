import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { teamProjectAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import './TeamProject.css';

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Completed' },
];

const COLORS = ['blue', 'green', 'purple', 'orange', 'red'];

export default function TeamProject() {
    const { teamId } = useParams();
    const lastMutationRef = useRef(0);

    const [board, setBoard] = useState({
        todo: [],
        inprogress: [],
        done: [],
    });

    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [progressValue, setProgressValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const loadBoard = async () => {
        const res = await teamProjectAPI.getProject(teamId);
        setBoard(res.data);
    };

    useEffect(() => {
        loadBoard();
    }, [teamId]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isDragging) return;
            if (Date.now() - lastMutationRef.current < 800) return;
            loadBoard();
        }, 1000);

        return () => clearInterval(interval);
    }, [isDragging, teamId]);

    const createTask = async () => {
        if (!newTask.trim()) return;
        await teamProjectAPI.addTask(teamId, { title: newTask.trim() });
        lastMutationRef.current = Date.now();
        setNewTask('');
    };

    const onDragStart = () => setIsDragging(true);

    const onDragEnd = async ({ source, destination, draggableId }) => {
        setIsDragging(false);
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        setBoard(prev => {
            const next = structuredClone(prev);
            const task = next[source.droppableId][source.index];
            next[source.droppableId].splice(source.index, 1);
            next[destination.droppableId].splice(destination.index, 0, {
                ...task,
                status: destination.droppableId,
            });
            return next;
        });

        lastMutationRef.current = Date.now();

        await teamProjectAPI.updateStatus(teamId, draggableId, {
            status: destination.droppableId,
            order: Date.now(),
        });
    };

    const saveProgress = async (taskId) => {
        await teamProjectAPI.updateProgress(teamId, taskId, progressValue);
        lastMutationRef.current = Date.now();
        setEditingTask(null);
    };

    return (
        <>
            <Navbar />

            <div className="project-board">
                <h2>Project Board</h2>

                {/* CREATE TASK */}
                <div className="task-create">
                    <input
                        placeholder="Add a new task…"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createTask()}
                    />
                    <button onClick={createTask}>Add Task</button>
                </div>

                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="columns">
                        {COLUMNS.map(col => (
                            <Droppable droppableId={col.id} key={col.id}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="column"
                                    >
                                        <h3>{col.title}</h3>

                                        {board[col.id].map((task, index) => (
                                            <Draggable
                                                key={task._id}
                                                draggableId={task._id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`task-card ${task.color || 'blue'} ${snapshot.isDragging ? 'dragging' : ''}`}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            '--progress':
                                                                task.status === 'done'
                                                                    ? '100%'
                                                                    : `${task.progress || 0}%`,
                                                        }}
                                                    >
                                                        <span className="task-title">{task.title}</span>

                                                        {/* IN PROGRESS */}
                                                        {task.status === 'inprogress' && (
                                                            <div className="task-actions">
                                                                {editingTask === task._id ? (
                                                                    <>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={progressValue}
                                                                            onChange={(e) =>
                                                                                setProgressValue(+e.target.value)
                                                                            }
                                                                        />
                                                                        <button onClick={() => saveProgress(task._id)}>
                                                                            Save
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingTask(task._id);
                                                                            setProgressValue(task.progress || 0);
                                                                        }}
                                                                    >
                                                                        Progress
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* DONE → COLOR DROPDOWN */}
                                                        {task.status === 'done' && (
                                                            <div className="task-actions">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        className={`color-trigger color-${task.color || 'green'}`}
                                                                    >
                                                                        {task.color || 'green'}
                                                                    </DropdownMenuTrigger>

                                                                    <DropdownMenuContent className="color-menu">
                                                                        {COLORS.map(c => (
                                                                            <DropdownMenuItem
                                                                                key={c}
                                                                                className="color-item"
                                                                                onClick={async () => {
                                                                                    await teamProjectAPI.updateColor(teamId, task._id, c);
                                                                                    lastMutationRef.current = Date.now();
                                                                                }}
                                                                            >
                                                                                <span className={`color-dot color-${c}`} />
                                                                                <span className="capitalize">{c}</span>
                                                                            </DropdownMenuItem>
                                                                        ))}

                                                                        <DropdownMenuSeparator />

                                                                        <DropdownMenuItem
                                                                            className="delete-item"
                                                                            onClick={async () => {
                                                                                // Optimistic UI
                                                                                setBoard(prev => ({
                                                                                    ...prev,
                                                                                    [task.status]: prev[task.status].filter(t => t._id !== task._id),
                                                                                }));

                                                                                lastMutationRef.current = Date.now();

                                                                                await teamProjectAPI.deleteTask(teamId, task._id);
                                                                            }}
                                                                        >
                                                                            Delete task
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>

                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </>
    );
}
