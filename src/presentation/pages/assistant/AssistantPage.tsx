
import { useEffect, useState } from 'react';
import { GptMessage, MyMessage, TextMessageBox, TypingLoader } from '../../components';
import { createThreadUseCase, postQuestionUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
}




export const AssistantPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [threadId, setThreadId] = useState<string>()

  // Obtener el thread, y si no existe, crearlo
  useEffect(() => {
    const threadId = localStorage.getItem('threadId');
    if (threadId) {
      setThreadId(threadId);
    } else {
      createThreadUseCase()
        .then((id) => {
          setThreadId(id);
          localStorage.setItem('threadId', id)
        })
    }
  }, []);

  // UseEffect para que aparezca el thread en los mensajes
  useEffect(() => {
    if (threadId) {
      setMessages((prev) => [...prev, {text: `Número de thread ${threadId}`, isGpt: true}]);
    }
  }, [threadId]) // Esto de aquí es la dependencia cuando aquí haya un cambio entonces lo que hay dentro de useEffect se ejecuta
  
  

  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string ) => {

    if (!threadId) return;

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    // Ahora llamariamos al useCase
    const replies = await postQuestionUseCase(threadId, text);
    
    setIsLoading(false);

    for (const reply of replies) {
      for (const message of reply.content) {
        setMessages((prev) => [
          ...prev,
          {text: message, isGpt: (reply.role === 'assistant'), info: reply}
        ])
        
      }

    }

  }



  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text="Buen día, soy Sam, Cúal es tu nombre? y En qué puedo ayudarte?" />

          {
            // Recorremos el arreglo de mensajes
            // Si usamos map necesitamos un key, no habría que poner en índice, pero al no tener nada más es lo único que podemos poner en este caso
            // Hbaría que poner un identificador único
            messages.map( (message, index) => (
              message.isGpt
                // Si el mensaje es de chatGPT
                ? (
                  <GptMessage key={ index } text={message.text} />
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