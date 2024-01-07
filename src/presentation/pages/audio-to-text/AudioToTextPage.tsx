

import { useState } from 'react';
import { GptMessage, MyMessage, TextMessageBoxFile, TypingLoader } from '../../components';
import { audioToTextUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
}




export const AudioToTextPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])


  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string, audioFile: File ) => {

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    // Ahora llamariamos al useCase
    const resp = await audioToTextUseCase(audioFile, text);
    setIsLoading(false);

    if (!resp) return; // No hay respuesta

    const gptMessage = `
## Transcripción:
__Duración:__ ${Math.round(resp.duration)} segundos
## El texto es:
${resp.text}    
`
    
    setMessages( (prev) => [
      ...prev,
      {text: gptMessage, isGpt: true}
    ]);

    for(const segment of resp.segments) {
      const segmentMessage = `
__De ${Math.round(segment.start)} a ${Math.round(segment.end)} segundos:__
${segment.text}
`

      setMessages( (prev) => [
        ...prev,
        {text: segmentMessage, isGpt: true}
      ]);
    }


  }



  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text="Hola, Qué audio quieres generar hoy?" />

          {
            // Recorremos el arreglo de mensajes
            // Si usamos map necesitamos un key, no habría que poner en índice, pero al no tener nada más es lo único que podemos poner en este caso
            // Hbaría que poner un identificador único
            messages.map( (message, index) => (
              message.isGpt
                // Si el mensaje es de chatGPT
                ? (
                  <GptMessage key={ index } text={ message.text } />
                )
                // Si el mensaje es nuestro
                : (
                  <MyMessage key={ index } text={ (message.text === '') ? 'Transcribe el audio': message.text } />
                )
                
            ))
          }

          
          {
            isLoading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader />
              </div>
            )
          }
          

        </div>
      </div>


      <TextMessageBoxFile 
        onSendMessage={ handlePost }
        placeholder='Escribe aquí lo que deseas'
        disableCorrections
        accept='audio/*'
      />

    </div>
  );
};