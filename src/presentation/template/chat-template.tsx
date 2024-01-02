import { useState } from 'react';
import { GptMessage, MyMessage, TextMessageBox, TypingLoader } from '../components';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
}




export const ChatTemplate = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])


  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string ) => {

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    // Ahora llamariamos al useCase
    //TODO: UseCase
    
    setIsLoading(false);

    // Todo: Añadir el mensaje de isGPT en true


  }



  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text="Hola, puedes escribir tu texto en español, y te ayudo con las correcciones" />

          {
            // Recorremos el arreglo de mensajes
            // Si usamos map necesitamos un key, no habría que poner en índice, pero al no tener nada más es lo único que podemos poner en este caso
            // Hbaría que poner un identificador único
            messages.map( (message, index) => (
              message.isGpt
                // Si el mensaje es de chatGPT
                ? (
                  <GptMessage key={ index } text="Esto es de OpenAI" />
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