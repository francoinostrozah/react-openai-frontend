export const createThreadUseCase = async (): Promise<string> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_ASSISTANT_API}/create-thread`, {
            method: 'POST'
        });

        const { id } = await response.json() as { id: string };

        return id;
    } catch (error) {
        throw new Error('Error creating thread');
    }
} 