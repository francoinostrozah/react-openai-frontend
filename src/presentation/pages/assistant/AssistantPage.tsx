import { useEffect, useState } from "react"
import { GptMessage, MyMessage, TextMessageBox, TypingLoader } from "../../components";
import { createThreadUseCase, postQuestionUseCase } from "../../../core/use-cases";

interface Message {
  text: string;
  isGpt: boolean;
}

export const AssistantPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string>();

  useEffect(() => {
    const threadId = localStorage.getItem('threadId');
    if (threadId) {
      setThreadId(threadId)
    } else {
      createThreadUseCase()
        .then((id: string) => {
          console.log(id);
          setThreadId(id);
          localStorage.setItem('threadId', id);
        })
    }
  }, []);

  useEffect(() => {
    if (threadId) {
      setMessages((prev) => [...prev, { text: `thread number: ${threadId}`, isGpt: true }])
    }
  }, [threadId])

  const handlePost = async (text: string) => {
    if (!threadId) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt: false }]);

    const replies = await postQuestionUseCase(threadId, text);

    setIsLoading(false);

    for (const reply of replies) {
      for (const message of reply.content) {
        setMessages((prev) => [...prev, { text: message, isGpt: reply.role === 'assistant', info: reply }]);
      }
    }

    setMessages((prev) => [...prev, { text: `thread number: ${threadId}`, isGpt: true }])

  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/** */}
          <GptMessage text="Good day, I am Hoid, how can I help you?" />

          {
            messages.map((message, index) => (
              message.isGpt ? (<GptMessage key={index} text={message.text} />)
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
        disableCorrections
      />
    </div>
  )
}
