/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useState } from "react"
import { GptMessage, GptMessageSelectableImage, MyMessage, TextMessageBox, TypingLoader } from "../../components";
import { imageGenerationUseCase, imageVariationUseCase } from "../../../core/use-cases";

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
      text: 'Base image',
      info: {
        alt: 'Base image',
        imageUrl: 'http://localhost:3000/gpt/image-generation/1718743175439.png'
      }
    }
  ]);
  const [originImageAndMask, setOriginImageAndMask] = useState({
    original: undefined as string | undefined,
    mask: undefined as string | undefined,
  });

  const handleVariation = async () => {
    setIsLoading(true);
    const response = await imageVariationUseCase(originImageAndMask.original!);
    setIsLoading(false);

    if (!response) return;

    setMessages((prev) => [...prev, { text: 'Variation', isGpt: true, info: { imageUrl: response.url, alt: response.alt } }]);

  }

  const handlePost = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt: false }]);

    const { original, mask } = originImageAndMask;

    const imageInfo = await imageGenerationUseCase(text, original, mask);
    setIsLoading(false);

    if (!imageInfo) {
      return setMessages((prev) => [...prev, { text: 'image could not be made', isGpt: true }]);
    }

    setMessages((prev) => [...prev, { text, isGpt: true, info: { imageUrl: imageInfo.url, alt: imageInfo.alt } }]);
  }

  return (
    <>
      {
        originImageAndMask.original && (
          <div className="fixed flex flex-col items-center top-10 right-10 z-10 fade-in">
            <span>Editing</span>
            <img
              className="border rounded-xl w-36 h-36 object-contain"
              src={originImageAndMask.mask ?? originImageAndMask.original}
              alt="Origin image"
            />
            <button onClick={handleVariation} className="btn-primary mt-2">Generate variation</button>
          </div>
        )
      }
      <div className="chat-container">
        <div className="chat-messages">
          <div className="grid grid-cols-12 gap-y-2">
            {/** */}
            <GptMessage text="What image would you like to generate today?" />

            {
              messages.map((message, index) => (
                message.isGpt ?
                  (<GptMessageSelectableImage
                    key={index}
                    text={message.text}
                    imageUrl={message.info?.imageUrl!}
                    alt={message.info?.alt!}
                    onImageSelected={(maskImageUrl) => setOriginImageAndMask({
                      original: message.info?.imageUrl!,
                      mask: maskImageUrl
                    })}
                  />)
                  : (<MyMessage
                    key={index}
                    text={message.text}
                  />)))
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
          onSendMessage={handlePost}
          placeholder="Write what you wish."
        />

      </div>
    </>
  )
}
