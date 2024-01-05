

import { useState } from 'react';
import { GptMessage, MyMessage, TextMessageBoxSelect, TypingLoader } from '../../components';
import { translateTextUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
}

const languages = [
  { id: "alemán", text: "Alemán" },
  { id: "árabe", text: "Árabe" },
  { id: "bengalí", text: "Bengalí" },
  { id: "francés", text: "Francés" },
  { id: "hindi", text: "Hindi" },
  { id: "inglés", text: "Inglés" },
  { id: "japonés", text: "Japonés" },
  { id: "mandarín", text: "Mandarín" },
  { id: "portugués", text: "Portugués" },
  { id: "ruso", text: "Ruso" },
];


export const TranslatePage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])


  // Función que maneje el estado de los mensajes
  const handlePost = async(text: string, selectedOptions: string) => {

    setIsLoading(true);

    const newMessage = `Traduce: "${text}" al idioma ${selectedOptions}`;

    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: newMessage, isGpt: false }] );

    // Ahora llamariamos al useCase
    const {ok, message} = await translateTextUseCase(text, selectedOptions);
    
    if (!ok) {
      setMessages( (prev) => [...prev, { text: "No se pudo realizar la corrección", isGpt: true }]);
    } else {
      setMessages( (prev) => [...prev, { text: message, isGpt: true}]);
    }

    setIsLoading(false);

    // Todo: Añadir el mensaje de isGPT en true


  }



  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text="Hola, Que quieres que traduzca hoy?" />

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
        options={languages}
      />

    </div>
  );
};