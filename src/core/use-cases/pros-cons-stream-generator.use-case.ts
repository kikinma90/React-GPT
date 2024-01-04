

// Hacemos el stream pero con funciones generadoras, que son nativas en javascript, es como los observable de rxjava
export async function* prosConsStreamGeneratorUseCase(prompt: string, abortSignal: AbortSignal) {

    try {

        const resp = await fetch(`${import.meta.env.VITE_GPT_API}/pros-cons-discusser-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt }),
            signal: abortSignal,
        });

        if (!resp.ok) throw new Error('No se pudo realizar la comparación');

        // Al traer la información como stream necesitamos un reader
        const reader = resp.body?.getReader();
        if (!reader) {
            console.log('No se pudo generar el reader');
            return null;
        }


        const decoder = new TextDecoder();

        let text = '';

        while (true) {

            const { value, done } = await reader.read();

            // Si recibimos done del reader, es que hemos acabado y salimos
            if (done) break;

            // Vamos cogiendo los cachos que recibimos
            const decodedChunk = decoder.decode(value, { stream: true });

            text += decodedChunk;
            yield text;
        }


    } catch (error) {
        
        return null;

    }


}