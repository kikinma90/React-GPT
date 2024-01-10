

import { useState } from 'react';
import { GptMessage, GptMessageImage, GptMessageSelectableImage, MyMessage, TextMessageBox, TypingLoader } from '../../components';
import { imageGenerationUseCase, imageVariationUseCase } from '../../../core/use-cases';

// Definimos aquí este interface porque lo vamos a usar solo en esta pantalla
interface Message {
  text: string;
  isGpt: boolean;
  info?: {
    imageUrl: string;
    alt: string;
  }
}

export const ImageTunningPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      isGpt: true,
      text: 'Imagen base',
      info: {
        alt: 'Imagen base',
        imageUrl: 'http://localhost:3000/gpt/image-generation/1704857346719.png'
      }
    }
  ])

  const [originalImageAndMask, setOriginalImageAndMask] = useState({
    original: undefined as 
      | string 
      | undefined,
    mask: undefined as string | undefined,
  });

  const handleVariation = async() => {
    setIsLoading(true);
    const resp = await imageVariationUseCase(originalImageAndMask.original!);
    setIsLoading(false);

    if (!resp) return;

    setMessages( (prev) => [
      ...prev, 
      { 
        text: 'Variación', 
        isGpt: true,
        info: {
          imageUrl: resp.url,
          alt: resp.alt,
        },
      }
    ]);
    
  }
  

  // Función que maneje el estado de los mensajes
  const handlePost = async( text: string ) => {

    setIsLoading(true);
    // prev son los mensajes anteriores, y a esos le annadimos el nuevo mensaje
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    const {original, mask} = originalImageAndMask;

    // Ahora llamariamos al useCase
    const imageInfo = await imageGenerationUseCase(text, original, mask);
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
    <>

      {
        originalImageAndMask.original && (
          <div className="fixed flex flex-col items-center top-10 right-10 z-10 fade-in">
            <span>Editando</span>
            <img
              className="border rounded-xl w-36 h-36 object-contain"
              // Si tenemos originalImageAndMask la mostramos y si no mostramos la otra
              src={originalImageAndMask.mask ?? originalImageAndMask.original}
              alt="Imagen original"
            />
            <button onClick={handleVariation} className="btn-primary mt-2">Generar variación</button>
          </div>
        )
      }

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
                  //<GptMessageImage
                  <GptMessageSelectableImage 
                    key={ index } 
                    text={message.text}
                    imageUrl={message.info?.imageUrl!}
                    alt={message.info?.alt!} 
                    onImageSelected={(maskImageUrl) => setOriginalImageAndMask({
                      original: message.info?.imageUrl!,
                      mask: maskImageUrl
                    }) }
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
    </>
  );
};