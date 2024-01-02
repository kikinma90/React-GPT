import { useState } from 'react';
import { GptMessage, GptOrthographyMessage, MyMessage, TextMessageBox, TypingLoader } from "../../components";
import { orthographyUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
  info?: {
    userScore: number;
    errors: string[];
    message: string;
  }
}




export const OrthographyPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])


  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string ) => {

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    // Ahora llamariamos al useCase
    const {ok, errors, message, userScore} = await orthographyUseCase(text);
    if (!ok) {
      setMessages( (prev) => [...prev, { text: "No se pudo realizar la corrección", isGpt: true }]);
    } else {
      setMessages( (prev) => [...prev, { 
        text: message, isGpt: true, 
        info: {userScore,errors,message} 
      }]);
    }
    
    setIsLoading(false);

    // Todo: Añadir el mensaje de isGPT en true


  }



  return (
    // tanto el chat-container como el chat-messages se encuentran en el archivo .css
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
                  <GptOrthographyMessage 
                    key={ index } 
                    // Hacer un spread de message.info
                    {...message.info!}
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