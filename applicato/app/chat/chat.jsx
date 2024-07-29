'use client'
// user information
import {useState} from 'react'

export const  Chat = () => {
    const [userText, setUserText] = useState("");
    const [messages,setMessages] = useState([]);


    const handleClick = async () => {
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userText }),
            });

        const data = await response.json();
        console.log(data)
        
        const newMessage = {
            prompt: data.prompt,
            ai: data.ai.text
        };
        console.log(newMessage)
       
        console.log(messages)


        setMessages((prevMessages) => [...prevMessages,newMessage])
    } catch (error) {
        console.log(error)
    }
    };
   

    return (
        <div>
            <h1>チャットを開始</h1>
            <div>
                {messages.map((message,index) => (
                    <div key={index}>
                        <p>{message.prompt}</p>
                        <p>{message.ai}</p>
                        <p></p>
                    </div>    
                ))}
            </div>
            <div>
                <input value={userText} type="text" onChange={(event) => setUserText(event.target.value)} />
                <button onClick={handleClick}>送信</button>
            </div>
        </div>
    )
}