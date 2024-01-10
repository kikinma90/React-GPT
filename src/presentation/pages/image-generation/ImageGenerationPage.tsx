
import { useState } from 'react';
import { GptMessage, GptMessageImage, MyMessage, TextMessageBox, TypingLoader } from '../../components';
import { imageGenerationUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
  info?: {
    imageUrl: string;
    alt: string;
  }
}

export const ImageGenerationPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])


  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string ) => {

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    // Ahora llamariamos al useCase
    const imageInfo = await imageGenerationUseCase(text);
    setIsLoading(false);

    if (!imageInfo) {
      return setMessages( (prev) => [...prev, { text: 'No se pudo generar la imagen', isGpt: true }] );
    }

    setMessages( (prev) => [
      ...prev, 
      { 
        text: text, 
        isGpt: true,
        info: {
          imageUrl: imageInfo.url,
          alt: imageInfo.alt,
        },
      }
    ]);

  }



  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text="Hola, Que imagen deseas generar hoy?" />

          {
            // Recorremos el arreglo de mensajes
            // Si usamos map necesitamos un key, no habría que poner en índice, pero al no tener nada más es lo único que podemos poner en este caso
            // Hbaría que poner un identificador único
            messages.map( (message, index) => (
              message.isGpt
                // Si el mensaje es de chatGPT
                ? (
                  <GptMessageImage 
                    key={ index } 
                    text={message.text}
                    imageUrl={message.info?.imageUrl!}
                    alt={message.info?.alt!} 
                  />
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


      <TextMessageBox 
        onSendMessage={ handlePost }
        placeholder='Escribe aquí lo que deseas'
        disableCorrections
      />

    </div>
  );
};