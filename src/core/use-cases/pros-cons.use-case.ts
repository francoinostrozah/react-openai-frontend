import { ProsConsResponse } from "../../interfaces";

export const prosConsUseCase = async (prompt: string, abortSignal: AbortSignal) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_GPT_API}/pros-cons-discusser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt }),
            signal: abortSignal
        });

        if (!response.ok) throw new Error('the comparation could not be made.')

        const data = await response.json() as ProsConsResponse;

        return {
            ok: true,
            ...data
        };
    } catch (error) {
        return {
            ok: false,
            content: 'The comparison could not be made.'
        }
    }
}