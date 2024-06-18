import { useState } from "react"
import { GptMessage, MyMessage, TextMessageBoxFile, TypingLoader } from "../../components";
import { audioToTextUseCase } from "../../../core/use-cases";

interface Message {
  text: string;
  isGpt: boolean;
}

export const AudioToTextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string, audioFile: File) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt: false }]);

    const response = await audioToTextUseCase(audioFile, text);
    console.log(response);

    if (!response) return;

    const gptMessage = `
      ## Transcription:
      __Duration__ ${Math.round(response.duration)} seconds
      ### Text:
      ${response.text}
    `;

    setMessages((prev) => [...prev, { text: gptMessage, isGpt: true }]);

    for (const segment of response.segments) {
      const segmentMessage = `
        __From ${Math.round(segment.start)} to ${Math.round(segment.end)} seconds:__
        ${segment.text}
      `;

      setMessages((prev) => [...prev, { text: segmentMessage, isGpt: true }]);
    }


    setIsLoading(false);
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/** */}
          <GptMessage text="Hello, what audio would you like to generate today?" />

          {
            messages.map((message, index) => (
              message.isGpt ? (<GptMessage key={index} text={message.text} />)
                : (<MyMessage key={index} text={message.text === '' ? 'Transcribe the audio.' : message.text} />)))
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

      <TextMessageBoxFile
        onSendMessage={handlePost}
        placeholder="Write what you wish."
        disableCorrections
        accept="audio/*"
      />
    </div>
  )
}
