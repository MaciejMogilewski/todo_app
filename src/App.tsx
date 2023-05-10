import { useEffect, useState } from 'react';
import { OperationForm } from './components/OperationForm.tsx';
import {
    callOperationsApi,
    callTaskApi,
    getOperationsApi,
    getTaskApi,
    Operation,
} from './helpers/Api.ts';
import AddSpentTimeForm from './components/AddSpentTimeForm';
import { Button, Container, Typography } from '@mui/material';
import calculateTotalTime from './helpers/Functions';
import AddTaskForm from './components/AddTaskForm';

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

    function handleDeleteTask(taskToDelete: Task) {
        return async function () {
            await callTaskApi({
                id: taskToDelete.id,
                method: 'delete',
            });

            // Todo pamiętać, że poza json server, to może być konieczne
            // for (const operation of taskToDelete.operations) {
            //     await callOperationsApi({
            //         id: operation.id,
            //         method: 'delete',
            //     });
            // }

            setTasks(tasks.filter(task => task.id !== taskToDelete.id));
        };
    }

    function handleDeleteOperation(operationToDelete: Operation) {
        return async function () {
            await callOperationsApi({
                id: operationToDelete.id,
                method: 'delete',
            });

            setTasks(
                tasks.map(task => ({
                    ...task,
                    operations: task.operations.filter(
                        operation => operation !== operationToDelete
                    ),
                }))
            );
        };
    }

    return (
        <Container maxWidth="md">
            <AddTaskForm
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                handleSubmit={handleSubmit}
            />
            <div>
                {tasks.map(task => (
                    <div key={task.id}>
                        <div
                            style={{
                                marginBottom: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                variant="h4"
                                color="#424242"
                                fontFamily="Roboto"
                            >
                                Title: {task.name}
                            </Typography>
                            <Typography
                                variant="h6"
                                color="#424242"
                                fontFamily="Roboto"
                            >
                                Description: {task.description}
                            </Typography>
                        </div>
                        {task.status === 'open' ? (
                            <>
                                <Button
                                    style={{ marginRight: 10 }}
                                    variant="contained"
                                    onClick={() => setActiveTaskId(task.id)}
                                >
                                    Add operation
                                </Button>
                                <Button
                                    color="success"
                                    style={{ marginRight: 10 }}
                                    variant="contained"
                                    onClick={handleFinishTask(task)}
                                >
                                    Finish
                                </Button>
                            </>
                        ) : (
                            <b>{calculateTotalTime(task.operations)}</b>
                        )}
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleDeleteTask(task)}
                        >
                            Delete
                        </Button>
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
                                    {~~(operation.spentTime / 60)}h{' '}
                                    {operation.spentTime % 60}m
                                    {activeOperationId === operation.id ? (
                                        <AddSpentTimeForm
                                            operation={operation}
                                            setTasks={setTasks}
                                            onCancel={setActiveOperationId}
                                        />
                                    ) : (
                                        task.status === 'open' && (
                                            <button
                                                onClick={() =>
                                                    setActiveOperationId(
                                                        operation.id
                                                    )
                                                }
                                            >
                                                Add spent time
                                            </button>
                                        )
                                    )}
                                    {task.status === 'open' && (
                                        <button
                                            onClick={handleDeleteOperation(
                                                operation
                                            )}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                            <br />
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
}

export default App;
