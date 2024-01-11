
export const createThreadUseCase = async () => {

    try {

        // El VITE_ es para que sea una variable pública
        const resp = await fetch(`${import.meta.env.VITE_ASSISTANT_API}/create-thread`, {
            method: 'POST',
        });

        const {id} = await resp.json() as {id:string};

        return id;

    } catch (error) {
        throw new Error('Error creating thread');
    }
}