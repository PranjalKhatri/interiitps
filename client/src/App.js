import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import showdown from 'showdown';
import hljs from 'highlight.js'; // Import highlight.js
import 'highlight.js/styles/github-dark.css'; // Import highlight.js styles

function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:6000';

  // Highlight.js extension for showdown
  const codeHighlightExtension = () => {
    return [
      {
        type: 'output',
        filter(text) {
          // Apply highlight.js to code blocks
          const regex = /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/g;
          return text.replace(regex, (match, code) => {
            const highlighted = hljs.highlightAuto(code).value;
            return `<pre class="bg-gray-500 p-4 rounded-lg"><code class="hljs">${highlighted}</code></pre>`;
          });
        },
      },
    ];
  };

  // Set up showdown converter with code highlight extension
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

      // Add user question to the conversation
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

          // Update conversation with the accumulated message as "bot"
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

  // Function to convert message content to HTML
  const convertToHtml = (content) => {
    // Use the showdown converter to convert markdown to HTML
    const html = converter.makeHtml(content);
  
    // Use regex to decode HTML entities
    const decodedHtml = html.replace(/&(lt|gt|amp);/g, (match, entity) => {
      switch (entity) {
        case 'lt':
          return '<';
        case 'gt':
          return '>';
        case 'amp':
          return '&';
        default:
          return match; // Fallback to the original match
      }
    }).replace(/&quot;/g, '"'); // Decode additional entities if needed
  
    return { __html: decodedHtml };
  };
  
 
  
  const testContent = `std::cout &lt;&lt; "Enter the number of elements: "; std::cin &gt;&gt; numElements;`;
  const convertedHtml = convertToHtml(testContent);
  console.log(convertedHtml); // Should correctly output the expected HTML
  
  return (
    <div className="h-[1000px] w-full m-0 p-0 font-inter font-bold bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="max-w-[800px] mx-auto p-10">
        <h1 className="text-white text-3xl mb-5 text-center">Chat with me</h1>

        {/* Chat container */}
        <div className="h-[400px] overflow-y-auto bg-[#2d2d2d] rounded-lg p-5 shadow-lg mb-5">
          {conversation.map((msg, index) => (
            <div key={index} className="mb-4 flex items-start text-left"> {/* Ensure text-left */}
              <strong className={`mr-2 ${msg.role === 'user' ? 'text-[#00aaff]' : 'text-[#ff9800]'}`}>
                {msg.role === 'user' ? 'You' : 'GPT-4'}:
              </strong>
              {/* Render message as HTML */}
              <span
                dangerouslySetInnerHTML={convertToHtml(msg.content)}
                className="markdown-body"
              />
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input section */}
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

        {/* New Chat Button */}
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
