'use client'

import { useState } from 'react';

export const Chat = () => {
  const [userText, setUserText] = useState("");
  const [messages, setMessages] = useState([]);
  const [taicho, setTaicho] = useState("");
  const [arerugi, setArerugi] = useState("");
  const [kibun, setKibun] = useState("");
  const [youbou, setYoubou] = useState("");
  const [shokuji, setShokuji] = useState(""); // 新しく追加
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false);

  const handleInfoSubmit = () => {
    setIsInfoSubmitted(true);
  };

  const handleClick = async () => {
    try {
      const prompt = `
        ユーザー情報:
        体調: ${taicho}
        アレルギー: ${arerugi}
        気分: ${kibun}
        要望: ${youbou}
        食事場所: ${shokuji}

        ユーザーの入力:
        ${userText}
      `;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log(data);

      const newMessage = {
        prompt: userText,
        ai: data.ai,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setUserText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>チャットを開始</h1>
      {!isInfoSubmitted ? (
        <div>
          <div>
            <label>体調:</label>
            <input type="text" value={taicho} onChange={(e) => setTaicho(e.target.value)} />
          </div>
          <div>
            <label>アレルギー:</label>
            <input type="text" value={arerugi} onChange={(e) => setArerugi(e.target.value)} />
          </div>
          <div>
            <label>気分:</label>
            <input type="text" value={kibun} onChange={(e) => setKibun(e.target.value)} />
          </div>
          <div>
            <label>要望:</label>
            <input type="text" value={youbou} onChange={(e) => setYoubou(e.target.value)} />
          </div>
          <div>
            <label>食事場所:</label>
            <input type="text" value={shokuji} onChange={(e) => setShokuji(e.target.value)} />
          </div>
          <button onClick={handleInfoSubmit}>情報を送信</button>
        </div>
      ) : (
        <div>
          <div>
            {messages.map((message, index) => (
              <div key={index}>
                <p>ユーザー: {message.prompt}</p>
                <p>AI: {typeof message.ai === 'object' ? JSON.stringify(message.ai) : message.ai}</p>
              </div>
            ))}
          </div>
          <div>
            <input
              value={userText}
              type="text"
              onChange={(event) => setUserText(event.target.value)}
            />
            <button onClick={handleClick}>備考を送信</button>
          </div>
        </div>
      )}
    </div>
  );
};
