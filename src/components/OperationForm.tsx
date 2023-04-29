import { Dispatch, SetStateAction, useState } from 'react';
import { callApi, Operation } from '../helpers/Api';
import { Task } from '../App';

interface OperationFormProps {
    onCancel: Dispatch<number | null>;
    taskId: number;
    setTasks: Dispatch<SetStateAction<Task[]>>;
}

export function OperationForm({
    onCancel,
    taskId,
    setTasks,
}: OperationFormProps) {
    const [value, setValue] = useState('');

    async function handleAddOperation(e) {
        e.preventDefault();

        const operation: Operation = await callApi({
            data: {
                description: value,
                addedDate: new Date(),
                spentTime: 0,
                taskId,
            },
            endpoint: 'operations',
            method: 'post',
        });

        // setTasks(prev =>
        //     prev.map(task => ({
        //         ...task,
        //         operations:
        //             task.id !== taskId
        //                 ? task.operations
        //                 : [...task.operations, operation],
        //     }))
        // );

        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    task.operations.push(operation);
                }

                return task;
            })
        );
    }

    return (
        <form onSubmit={handleAddOperation}>
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
            />
            <button type="submit">Add</button>
            <button onClick={() => onCancel(null)}>Cancel</button>
        </form>
    );
}
