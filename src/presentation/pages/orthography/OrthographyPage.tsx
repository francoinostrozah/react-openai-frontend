import { useState } from "react"
import { GptMessage, GptOrthographyMessage, MyMessage, TextMessageBox, TextMessageBoxFile, TextMessageBoxSelect, TypingLoader } from "../../components"
import { orthographyUseCase } from "../../../core/use-cases";

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
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt: false }]);

    const { ok, errors, message, userScore } = await orthographyUseCase(text);

    if (!ok) {
      setMessages((prev) => [...prev, { text: 'The correction could not be made.', isGpt: true }]);
    } else {
      setMessages((prev) => [...prev, {
        text: message, isGpt: true, info: {
          errors,
          message,
          userScore,
        }
      }]);
    }

    setIsLoading(false);
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/** */}
          <GptMessage text="Hello, you can writte your text in spanish, and I will help you with the corrections" />

          {
            messages.map((message, index) => (
              message.isGpt
                ? (<GptOrthographyMessage
                  key={index}
                  {...message.info!} />)
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

      {/* <TextMessageBoxF
        onSendMessage={handlePost}
        placeholder="Write what you wish."
        disableCorrections
      /> */}
      {/* <TextMessageBoxFile
        onSendMessage={handlePost}
        placeholder="Write what you wish."
      /> */}
      <TextMessageBoxSelect
        onSendMessage={handlePost}
        options={[{ id: "1", text: "hello" }, { id: '2', text: 'world' }]}
      />

    </div>
  )
}
