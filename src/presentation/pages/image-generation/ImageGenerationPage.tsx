import { useState } from "react"
import { GptMessage, GptMessageImage, MyMessage, TextMessageBox, TypingLoader } from "../../components";
import { imageGenerationUseCase } from "../../../core/use-cases";

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
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt: false }]);

    const imageInfo = await imageGenerationUseCase(text);

    if (!imageInfo) {
      return setMessages((prev) => [...prev, { text: 'image could not be made', isGpt: true }]);
    }

    setMessages((prev) => [...prev, { text, isGpt: true, info: { imageUrl: imageInfo.url, alt: imageInfo.alt } }]);

    setIsLoading(false);

  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/** */}
          <GptMessage text="What image would you like to generate today?" />

          {
            messages.map((message, index) => (
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              message.isGpt ? (<GptMessageImage key={index} text={message.text} imageUrl={message.info?.imageUrl!} alt={message.info?.alt!} />)
                : (<MyMessage key={index} text={message.text} />)))
          }

          {
            isLoading && (
              <div className="col-start-1 col-end-1 fade-in">
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
  )
}
