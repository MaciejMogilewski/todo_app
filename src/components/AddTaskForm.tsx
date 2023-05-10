import { Button, Stack, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface AddTaskFormProps {
    name: string;
    setName: Dispatch<SetStateAction<string>>;
    description: string;
    setDescription: Dispatch<SetStateAction<string>>;
    handleSubmit: () => Promise<void>;
}

function AddTaskForm({
    name,
    setName,
    description,
    setDescription,
    handleSubmit,
}: AddTaskFormProps) {
    return (
        <form
            onSubmit={async e => {
                e.preventDefault();
                await handleSubmit();
            }}
            style={{ marginBottom: 40 }}
        >
            <Stack spacing={2} direction="column">
                <TextField
                    label="Title"
                    variant="outlined"
                    type="text"
                    id="task"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <TextField
                    label="Description"
                    variant="outlined"
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <Button variant="contained" type="submit">
                    Add
                </Button>
            </Stack>
        </form>
    );
}

export default AddTaskForm;
