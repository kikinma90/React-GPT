// Como es una interface se le puede poner type
import type { AudioToTextResponse } from "../../interfaces";



export const audioToTextUseCase = async(audioFile: File, prompt?: string) => {

    try {

        // Como la api lo recibe mediante form data para poder adjuntar audios, lo hacemos de la siguiente manera
        const formData = new FormData();
        formData.append('file', audioFile);
        if (prompt) {
            formData.append('prompt', prompt);
        }

        const resp = await fetch(`${import.meta.env.VITE_GPT_API}/audio-to-text`, {
            method: 'POST',
            body: formData,
        });

         const data = await resp.json() as AudioToTextResponse;

         return data;

    } catch (error) {
        return null;
    }


}