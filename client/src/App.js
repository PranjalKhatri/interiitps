import React, { useState, useRef } from 'react';
import axios from 'axios'; // Import Axios
// require("dotenv").config();


function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:6000';
  console.log(backendUrl);
  // Function to submit question to the server
  // const askQuestion = async () => {
  //   console.log("helloö");
  //   setLoading(true); 
  //   try {

  //     console.log(question);
  //     const response = await axios.post(`${backendUrl}/api/v1/chat`, {
  //       prompt: question, 
  //       newChat : false,
  //     });
   
  //     // Assuming the response data structure includes a message and role
  //     const newMessage = {
  //       role: 'user',
  //       content: question // Use the question as the content for user message
  //     };

  //     const botMessage = {
  //       role: 'bot',
  //       content: response.data.message // Use response message from the server
  //     };

  //     setConversation([...conversation, newMessage, botMessage]);
  //     setQuestion('');
      
  //     chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the bottom of chat
  //   } catch (error) {
  //     console.error('Error asking question:', error);
  //   } finally {
  //     setLoading(false); 
  //   }
  // };

  const askQuestionStream = async () => {
    console.log("Starting question stream...");
    setLoading(true);
    
    try {
      console.log(question);
      
      const response = await fetch(`${backendUrl}/api/v1/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
  
      // Add user question to the conversation first
      setConversation((prev) => [
        ...prev,
        { role: 'user', content: question }, // Add user message
      ]);
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);
  
        const parsedChunk = JSON.parse(chunk);
        if (parsedChunk.data) {
          accumulatedMessage += parsedChunk.data;
  
          // Update conversation with the accumulated message as "bot"
          setConversation((prev) => {
            const lastBotMessage = prev[prev.length - 1];
            if (lastBotMessage && lastBotMessage.role === 'bot') {
              return [
                ...prev.slice(0, -1),
                { ...lastBotMessage, content: accumulatedMessage }, // Update last bot message
              ];
            } else {
              return [
                ...prev,
                { role: 'bot', content: accumulatedMessage }, // New bot message
              ];
            }
          });
  
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
  
      // Clear the question input after processing
      setQuestion('');
  
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to get a response. Please try again.'); // Notify user of the error
    } finally {
      setLoading(false);
    }
  };
  
  

  const deleteChat = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`${backendUrl}/api/v1/chat/6700be9f3bff66d6fb71385a`);
      if (response.status === 200) {
        // Handle successful response (e.g., clear conversation)
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

  return (
    <div className="h-[1000px] w-full m-0 p-0 font-inter font-bold bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="max-w-[800px] mx-auto p-10 text-center">
        <h1 className="text-white text-3xl mb-5">Chat with me</h1>

        {/* Chat container */}
        <div className="h-[400px] overflow-y-auto bg-[#2d2d2d] rounded-lg p-5 shadow-lg mb-5">
          {conversation.map((msg, index) => (
            <div key={index} className="mb-4 flex items-start">
              <strong className={`mr-2 ${msg.role === 'user' ? 'text-[#00aaff]' : 'text-[#ff9800]'}`}>
                {msg.role === 'user' ? 'You' : 'GPT-4'}:
              </strong>
              <span>{msg.content}</span>
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
};


export default App;
