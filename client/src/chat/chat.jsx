import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import showdown from 'showdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function Chat() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);
  const chatEndRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const [file, setFile] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:6000';

  function speak(val) {
    let utterance = new SpeechSynthesisUtterance(val);
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === "Google UK English Female");
    utterance.voice = selectedVoice;
    speechSynthesis.speak(utterance);
  }

  // Speech recognition hooks
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  // Effect to update the question state with the latest transcript
  useEffect(() => {
    setQuestion(transcript); // Update question with the current transcript
  }, [transcript]);

  // Check if the browser supports speech recognition
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Browser does not support speech recognition.</span>;
  }

  const startListening = () => {
    resetTranscript(); // Optional: reset transcript only if desired
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const codeHighlightExtension = () => {
    return [
      {
        type: 'output',
        filter(text) {
          const regex = /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/g;
          return text.replace(regex, (match, code) => {
            const highlighted = hljs.highlightAuto(code).value;
            return `<pre class="bg-gray-500 p-1 rounded-none"><code class="hljs">${highlighted}</code></pre>`;
          });
        },
      },
    ];
  };

  const converter = new showdown.Converter({ extensions: [codeHighlightExtension] });

  const askQuestionStream = async (e) => {
    e.preventDefault();
    if (!question.trim() && !file) {
      alert('Please enter a question or upload a file.');
      return;
    }

    setLoading(true);
    let response;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("prompt", question);
        formData.append("newChat", false);
        formData.append("file", file);
        response = await fetch(`${backendUrl}/api/v1/chat/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
          
        });
      } else {
        response = await fetch(`${backendUrl}/api/v1/chat/`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: question,
            newChat: false,
          }),
          
        });
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = '';

      setConversation((prev) => [
        ...prev,
        { role: 'user', content: question },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const parsedChunk = JSON.parse(chunk);
        if (parsedChunk.data) {
          accumulatedMessage += parsedChunk.data;

          setConversation((prev) => {
            let lastBotMessage = prev[prev.length - 1];
            if (lastBotMessage && lastBotMessage.role === 'bot') {
              return [
                ...prev.slice(0, -1),
                { ...lastBotMessage, content: accumulatedMessage },
              ];
            } else {
              return [
                ...prev,
                { role: 'bot', content: accumulatedMessage },
              ];
            }
          });

          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }

      setQuestion('');
      setFile(null);
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hello = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/chat/`);
      const chats = response.data.data;

      if (chats.length !== 0) {
        speak(chats[chats.length - 1].parts[0].text);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const deleteChat = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`${backendUrl}/api/v1/chat/6700be9f3bff66d6fb71385a`);
      if (response.status === 200) {
        setConversation([]);
        alert('Chats deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting chats:', error);
      alert('Failed to delete chats.');
    } finally {
      setLoading(false);
    }
  };

  const convertToHtml = (content) => {
    const html = converter.makeHtml(content);
    const decodedHtml = html.replace(/&(lt|gt|amp);/g, (match, entity) => {
      switch (entity) {
        case 'lt':
          return '<';
        case 'gt':
          return '>';
        case 'amp':
          return '&';
        default:
          return match;
      }
    }).replace(/&quot;/g, '"');

    return { __html: decodedHtml };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyNotification(true);
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }
        notificationTimeoutRef.current = setTimeout(() => {
          setCopyNotification(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Error copying to clipboard:', err);
      });
  };

  const containsCode = (content) => {
    const regex = /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/;
    return regex.test(content);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <>
      <div className="h-auto min-h-[800px] w-full bg-gray-900 text-white flex items-center justify-center">
        <div className="w-[60%] p-8 flex flex-col bg-gray-900 h-auto">
          {copyNotification && (
            <div className="absolute top-0 right-0 bg-green-500 text-white p-2 rounded-md mt-4 mr-4">
              Copied!
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-center mb-4">Chat with VenusX</h1>
          <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 shadow-lg mb-4 min-h-[300px] flex flex-col">
            {conversation.map((msg, index) => (
              <div key={index} className="mb-2 flex items-start">
                <strong className={`mr-2 ${msg.role === 'user' ? 'text-blue-400' : 'text-orange-400'}`}>
                  {msg.role === 'user' ? 'You' : 'GPT-4'}:
                </strong>
                <div
                  dangerouslySetInnerHTML={convertToHtml(msg.content)}
                  className="flex-1 markdown-body"
                />
                {msg.role === 'bot' && (
                  <>
                    <button
                      onClick={() => {
                        copyToClipboard(msg.content.replace(/<[^>]*>/g, ''));
                      }}
                      className="ml-2 bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                      Copy Response
                    </button>
                    <button
                      onClick={() => speak(msg.content.replace(/<[^>]*>/g, ''))}
                      className="ml-2 bg-purple-500 text-white py-1 px-2 rounded-md hover:bg-purple-600 text-sm"
                    >
                      Speak Response
                    </button>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question or dictate..."
              className="flex-1 p-2 rounded-lg border border-gray-700 bg-gray-800 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={askQuestionStream}
              className={`bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Send'}
            </button>
            {/* Speech recognition buttons */}
            <button
              onClick={startListening}
              className={`bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 ${listening ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={listening}
            >
              🎤 Start
            </button>
            <button
              onClick={stopListening}
              className={`bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 ${!listening ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!listening}
            >
              Stop
            </button>
          </div>
          <div className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="border border-gray-700 bg-gray-800 text-white py-2 px-4 rounded-lg"
            />
          </div>
          <button onClick={deleteChat} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
            Delete Chat
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
