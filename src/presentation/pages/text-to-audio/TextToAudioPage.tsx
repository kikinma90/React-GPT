

import { useState } from 'react';
import { GptMessage, GptMessageAudio, MyMessage, TextMessageBoxSelect, TypingLoader } from '../../components';
import { textToAudioUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface TextMessage {
  text: string;
  isGpt: boolean;
  type: 'text';
}

interface AudioMessage {
  text: string;
  isGpt: boolean;
  audio: string;
  type: 'audio';
}

type Message = TextMessage | AudioMessage;


export const TextToAudioPage = () => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])
  
  //## es porque como esto lo estamos mandando como markdown para que lo ponga como un titulo mas pequeño
  const disclaimer = `## Hola, Que audio quieres generar hoy?
  * Todo el audio generado es por AI
  `

  const voices = [
    { id: "nova", text: "Nova" },
    { id: "alloy", text: "Alloy" },
    { id: "echo", text: "Echo" },
    { id: "fable", text: "Fable" },
    { id: "onyx", text: "Onyx" },
    { id: "shimmer", text: "Shimmer" },
  ]

  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string, selectedVoice: string ) => {

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages((prev) => [...prev, { text: text, isGpt: false, type: 'text' }]);

    // Ahora llamariamos al useCase
    const {ok, message, audioUrl} = await textToAudioUseCase(text,selectedVoice);
    
    setIsLoading(false);

    if (!ok) return;

    setMessages((prev) => [
      ...prev, 
      { text: `${selectedVoice} - ${message}`, isGpt: true, type: 'audio', audio: audioUrl! },
    ]);

    // Todo: Añadir el mensaje de isGPT en true


  }



  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text={disclaimer} />

          {
            // Recorremos el arreglo de mensajes
            // Si usamos map necesitamos un key, no habría que poner en índice, pero al no tener nada más es lo único que podemos poner en este caso
            // Hbaría que poner un identificador único
            messages.map( (message, index) => (
              message.isGpt
                // Si el mensaje es de chatGPT
                ? (
                  message.type === 'audio'
                  ? (
                    <GptMessageAudio 
                      key={ index } 
                      text={ message.text }
                      audio={message.audio}
                    />
                  ) : (
                    <GptMessage key={ index } text={ message.text } />
                  )
                )
                // Si el mensaje es nuestro
                : (
                  <MyMessage key={ index } text={ message.text } />
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


      <TextMessageBoxSelect
        onSendMessage={ handlePost }
        placeholder='Escribe aquí lo que deseas'
        options={voices}
      />

    </div>
  );
};