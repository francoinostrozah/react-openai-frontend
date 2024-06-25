export const prosConsStreamUseCase = async (prompt: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_GPT_API}/pros-cons-discusser-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) throw new Error('the comparation could not be made.')

        const reader = response.body?.getReader();

        if (!reader) {
            return null;
        }

        return reader;
    } catch (error) {
        return {
            ok: false,
            content: 'The comparison could not be made.'
        }
    }
}