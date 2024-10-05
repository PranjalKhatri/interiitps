import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import showdown from 'showdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false); // State for copy notification
  const chatEndRef = useRef(null);
  const notificationTimeoutRef = useRef(null); // Ref for notification timeout

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:6000';

  // Highlight.js extension for showdown
  const codeHighlightExtension = () => {
    return [
      {
        type: 'output',
        filter(text) {
          const regex = /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/g;
          return text.replace(regex, (match, code) => {
            const highlighted = hljs.highlightAuto(code).value;
            return `<pre class="bg-gray-500 p-4 rounded-lg"><code class="hljs">${highlighted}</code></pre>`;
          });
        },
      },
    ];
  };

  const converter = new showdown.Converter({ extensions: [codeHighlightExtension] });

  const askQuestionStream = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: question,
          newChat: false,
        }),
      });

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
            const lastBotMessage = prev[prev.length - 1];
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
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
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

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyNotification(true);
        // Clear notification after 2 seconds
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

  return (
    <div className="h-[800px] w-full m-0 p-0 font-inter font-bold bg-[#1e1e1e] text-[#d4d4d4]">
      {copyNotification && (
        <div className="sticky top-0 bg-green-500 text-white text-center py-2">
          Copied!
        </div>
      )}
      <div className="max-w-[800px] mx-auto p-10">
        <h1 className="text-white text-3xl mb-5 text-center">Chat with me</h1>

        <div className="h-[400px] overflow-y-auto bg-[#2d2d2d] rounded-lg p-5 shadow-lg mb-5">
          {conversation.map((msg, index) => (
            <div key={index} className="mb-4 flex items-start text-left">
              <strong className={`mr-2 ${msg.role === 'user' ? 'text-[#00aaff]' : 'text-[#ff9800]'}`}>
                {msg.role === 'user' ? 'You' : 'GPT-4'}:
              </strong>
              <span
                dangerouslySetInnerHTML={convertToHtml(msg.content)}
                className="markdown-body"
              />
              {msg.role === 'bot' && !containsCode(msg.content) && (
                <button
                  onClick={() => {
                    // Copy only simple language version of text
                    const simpleText = msg.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
                    copyToClipboard(simpleText);
                  }}
                  className="ml-4 bg-[#007bff] text-white py-1 px-2 rounded-md hover:bg-[#0056b3] text-sm"
                >
                  Copy
                </button>
              )}
              {msg.role === 'bot' && containsCode(msg.content) && (
                <button
                  onClick={() => {
                    const regex = /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/;
                    const codeMatch = regex.exec(convertToHtml(msg.content).__html);
                    if (codeMatch && codeMatch[1]) {
                      copyToClipboard(codeMatch[1]);
                    }
                  }}
                  className="ml-4 bg-[#007bff] text-white py-1 px-2 rounded-md hover:bg-[#0056b3] text-sm"
                >
                  Copy Code
                </button>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <textarea
          className="w-full bg-[#2d2d2d] font-inter font-normal text-white border-none p-4 text-lg rounded-md outline-none resize-none mb-5"
          rows="4"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <br />
        <button
          className={`bg-[#007bff] text-white py-2 px-4 text-lg rounded-md cursor-pointer mb-5 ${loading ? 'bg-[#555] cursor-not-allowed' : 'hover:bg-[#0056b3]'}`}
          onClick={askQuestionStream}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Ask'}
        </button>

        <button
          className={`bg-[#dc3545] text-white py-2 px-4 text-lg rounded-md cursor-pointer mb-5 ${loading ? 'bg-[#555] cursor-not-allowed' : 'hover:bg-[#c82333]'}`}
          onClick={deleteChat}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New Chat'}
        </button>
      </div>
    </div>
  );
}

export default App;
