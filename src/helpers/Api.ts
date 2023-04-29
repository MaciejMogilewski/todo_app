import axios from 'axios';
import { Task, TaskStatus } from '../App';

export async function callApi(
    config: TaskApiArgs | TaskApiArgsWithoutData
): Promise<Task | Operation> {
    const { method, endpoint } = config;
    const requestConfig: {
        method: string;
        url: string;
        data?: Task | TaskStatus;
    } = {
        method,
        url: `http://localhost:3000/api/v1/${endpoint}`,
    };

    if (!['get', 'delete'].includes(method)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        requestConfig.data = config.data;
    }

    try {
        const response = await axios(requestConfig);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export interface Operation {
    id: number;
    description: string;
    addedDate: Date;
    spentTime: number;
    taskId: number;
}

type TaskApiArgs = {
    endpoint: string;
    data: Omit<Task, 'id'> | TaskStatus | Omit<Operation, 'id'>;
    method: 'post' | 'patch' | 'put';
};
type TaskApiArgsWithoutData = {
    method: 'get' | 'delete';
    endpoint: string;
};
