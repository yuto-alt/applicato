'use client'

import { useState } from 'react';
import axios from 'axios';

const cleanString = (str) => {
  const unwantedChars = /[\/\\,\*\n"textAI{}:]/g;
  return str.replace(unwantedChars, '');
};

const SearchResults = ({ searchResults }) => {
  return (
    <div>
      <h2>検索結果:</h2>
      {searchResults.length > 0 ? (
        searchResults.reduce((acc, result, index) => {
          const cleanedTitle = cleanString(result.title);
          const cleanedSnippet = cleanString(result.snippet);
          acc.push(
            <div key={index}>
              <h3>{cleanedTitle}</h3>
              <p>{cleanedSnippet}</p>
              <a href={result.link} target="_blank" rel="noopener noreferrer">リンク</a>
            </div>
          );
          return acc;
        }, [])
      ) : (
        <p>検索結果がありません。</p>
      )}
    </div>
  );
};

export const Chat = () => {
  const [userText, setUserText] = useState("");
  const [messages, setMessages] = useState([]);
  const [taicho, setTaicho] = useState("");
  const [arerugi, setArerugi] = useState("");
  const [kibun, setKibun] = useState("");
  const [youbou, setYoubou] = useState("");
  const [shokuji, setShokuji] = useState("");
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleInfoSubmit = () => {
    setIsInfoSubmitted(true);
  };

  const extractRestaurantInfo = (text) => {
    const restaurantRegex = /(?:レストラン|食堂|カフェ|ダイナー|料理屋|居酒屋|店|屋|日本|中華|イタリア|スペイン|フランス|アメリカ|インド|ネパール|タイ|韓国|和菓子|カレー|ラーメン|焼肉|ステーキ|ケーキ|寿司|ハンバーグ|プリン|二郎|そば|うどん|飯|うなぎ|)/g;
    const nameRegex = /(?:「)(.*?)(?:」)/g; // 「店名」を抽出するための正規表現
    const matches = text.match(restaurantRegex);
    const names = text.match(nameRegex)?.map((match) => match.replace(/[「」]/g, '')) || [];
    return { matches, names };
  };

  const sendToGoogleCustomSearch = async (query) => {
    try {
      const apiKey = 'AIzaSyCvHiNBCrfLT469LR8NARnkmLhYEt_qhdA';
      const searchEngineId = '74172df7c8b6b4031';

      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

      const response = await axios.get(apiUrl);
      console.log('Google Custom Search response:', response.data);

      setSearchResults(response.data.items || []);
    } catch (error) {
      console.error('Error sending data to Google Custom Search:', error);
    }
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

        以下の条件に基づいて具体的な飲食店名を提案してください。
      `;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('AIレスポンス:', data);

      const formattedAiResponse = typeof data.ai === 'object' ? JSON.stringify(data.ai).replace(/\\n|\\|[*]/g, '') : data.ai.replace(/\\n|\\|[*]/g, '');

      const newMessage = {
        prompt: userText,
        ai: formattedAiResponse,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setUserText("");

      const { matches: restaurants, names } = extractRestaurantInfo(formattedAiResponse);
      const query = [...restaurants, ...names, shokuji].filter(Boolean).join(' OR ');
      
      if (query) {
        await sendToGoogleCustomSearch(query);
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1 className="title">START CHATTING</h1>
      {!isInfoSubmitted ? (
        <div>
          <div className='text'>
            <label>体　　調　　:</label>
            <input type="text" value={taicho} onChange={(e) => setTaicho(e.target.value)} />
          </div>
          <div className='text'>
            <label>アレルギー　:</label>
            <input type="text" value={arerugi} onChange={(e) => setArerugi(e.target.value)} />
          </div>
          <div className='text'>
            <label>気　　分　　:</label>
            <input type="text" value={kibun} onChange={(e) => setKibun(e.target.value)} />
          </div>
          <div className='text'>
            <label>要　　望　　:</label>
            <input type="text" value={youbou} onChange={(e) => setYoubou(e.target.value)} />
          </div>
          <div className='text'>
            <label>食事場所　　:</label>
            <input type="text" value={shokuji} onChange={(e) => setShokuji(e.target.value)} />
          </div>
          <div className='send'>
          <button onClick={handleInfoSubmit}>SEND</button>
          </div>
        </div>
      ) : (
        <div>
          <div>
            {messages.map((message, index) => (
              <div key={index}>
                <p>ユーザー: {message.prompt}</p>
                <p>AI: {message.ai}</p>
              </div>
            ))}
          </div>
          <div>              
            <div className='send'>
              <input value={userText} type="text" onChange={(event) => setUserText(event.target.value)} />
              <button onClick={handleClick}>　SEND</button>
            </div>
          </div>
          <SearchResults searchResults={searchResults} />
        </div>
      )}
    </div>
  );
};
