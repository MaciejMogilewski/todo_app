import { useEffect, useState } from 'react';
import axios from 'axios';
import { OperationForm } from './components/OperationForm';
import { callApi, Operation } from './helpers/Api';

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

    useEffect(() => {
        const responses = Promise.all([
            getDataApi('tasks'),
            getDataApi('operations'),
        ]);
        responses.then(data => {
            const [tasks, operations] = data;
            // setTasks(
            //     tasks.map(task => {
            //         const taskOperations = operations.filter(
            //             operation => operation.taskId === task.id
            //         );
            //         return { ...task, operations: taskOperations };
            //     })
            // );
            setTasks(
                tasks.map(task => ({
                    ...task,
                    operations: operations.filter(
                        operation => operation.taskId === task.id
                    ),
                }))
            );

            // setTasks((tasks.reduce((acc, ce) => [...acc, {
            //     ..ce,
            //     operations: operations.filter((operation) => operation.taskId === ce.id)
            // }], [])));
        });
        // getTasksApi('tasks').then(data =>
        //     setTasks(data.map(task => ({ ...task, operations: [] })))
        // );
    }, []);

    async function getDataApi(endpoint: string): Promise<Task[] | Operation[]> {
        const response = await axios.get<Task[] | Operation[]>(
            `http://localhost:3000/api/v1/${endpoint}`
        );
        return response.data;
    }

    async function handleSubmit() {
        const data = await callApi({
            data: {
                addedDate: new Date(),
                description,
                name,
                status: 'open',
            },
            endpoint: 'tasks',
            method: 'post',
        });
        setTasks([...tasks, { ...data, operations: [] }]);
        setName('');
        setDescription('');
    }

    function handleFinishTask(task: Task) {
        return async function () {
            await callApi({
                endpoint: `tasks/${task.id}`,
                data: { status: 'closed' },
                method: 'patch',
            });

            task.status = 'closed';
            setTasks([...tasks]);
        };
    }

    function handleDeleteTask(id: number) {
        return async function () {
            await callApi({
                endpoint: `tasks/${id}`,
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
                <button type="submit">Add</button>
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
                                    <button>Add spent time</button>
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
