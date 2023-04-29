import { useEffect, useState } from 'react';
import { OperationForm } from './components/OperationForm.tsx';
import {
    callTaskApi,
    getOperationsApi,
    getTaskApi,
    Operation,
} from './helpers/Api.ts';
import AddSpentTimeForm from './components/AddSpentTimeForm';

export interface TaskStatus {
    status: 'open' | 'closed';
}
export interface Task extends TaskStatus {
    name: string;
    description: string;
    addedDate: Date;
    id: number;
    operations: Operation[];
}

function App() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [activeOperationId, setActiveOperationId] = useState<number | null>(
        null
    );

    useEffect(() => {
        const responses = Promise.all([getTaskApi(), getOperationsApi()]);
        responses.then(data => {
            const [tasks, operations] = data;

            setTasks(
                tasks.map(task => ({
                    ...task,
                    operations: operations.filter(
                        operation => operation.taskId === task.id
                    ),
                }))
            );
        });
    }, []);

    async function handleSubmit() {
        const data = await callTaskApi({
            data: {
                addedDate: new Date(),
                description,
                name,
                status: 'open',
            },
            method: 'post',
        });

        setTasks([...tasks, { ...data, operations: [] }]);
        setName('');
        setDescription('');
    }

    function handleFinishTask(task: Task) {
        return async function () {
            await callTaskApi({
                id: task.id,
                data: { status: 'closed' },
                method: 'patch',
            });

            task.status = 'closed';
            setTasks([...tasks]);
        };
    }

    function handleDeleteTask(id: number) {
        return async function () {
            await callTaskApi({
                id,
                method: 'delete',
            });

            setTasks(tasks.filter(task => task.id !== id));
        };
    }

    return (
        <>
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    await handleSubmit();
                }}
            >
                <label htmlFor="task">Task</label>
                <input
                    type="text"
                    id="task"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                ></textarea>
                <button type="submit">add</button>
            </form>
            <div>
                {tasks.map(task => (
                    <div key={task.id}>
                        <b>{task.name} </b>
                        <span>{task.description} </span>
                        {task.status === 'open' && (
                            <>
                                <button
                                    onClick={() => setActiveTaskId(task.id)}
                                >
                                    Add operation
                                </button>
                                <button onClick={handleFinishTask(task)}>
                                    Finish
                                </button>
                            </>
                        )}
                        <button onClick={handleDeleteTask(task.id)}>
                            Delete
                        </button>
                        {activeTaskId === task.id && (
                            <OperationForm
                                taskId={task.id}
                                onCancel={setActiveTaskId}
                                setTasks={setTasks}
                            />
                        )}
                        <div>
                            <hr />
                            {task.operations.map(operation => (
                                <div key={operation.id}>
                                    {operation.description}{' '}
                                    {operation.spentTime}
                                    {activeOperationId === operation.id ? (
                                        <AddSpentTimeForm
                                            operation={operation}
                                            setTasks={setTasks}
                                            onCancel={setActiveOperationId}
                                        />
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setActiveOperationId(
                                                    operation.id
                                                )
                                            }
                                        >
                                            Add spent time
                                        </button>
                                    )}
                                    <button>Delete</button>
                                </div>
                            ))}
                            <br />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default App;
