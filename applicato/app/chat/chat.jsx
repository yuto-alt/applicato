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
    const restaurantRegex = /(?:レストラン|食堂|カフェ|ダイナー|料理屋|居酒屋|店|屋|日本料理|中華料理|イタリア料理|スペイン料理|フランス料理|アメリカ料理|インド料理|ネパール料理|タイ料理|韓国料理)/g;
    const matches = text.match(restaurantRegex);
    return matches || [];
  };

  const sendToGoogleCustomSearch = async (restaurants, userPlace) => {
    try {
      const apiKey = 'AIzaSyCvHiNBCrfLT469LR8NARnkmLhYEt_qhdA'; 
      const searchEngineId = '74172df7c8b6b4031';

      if (restaurants.length === 0 && !userPlace) {
        console.log('飲食店または食事場所が見つかりませんでした。');
        return;
      }

      const query = [...restaurants, userPlace].filter(Boolean).join(' OR ');
      console.log('検索クエリ:', query);

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

      const restaurants = extractRestaurantInfo(formattedAiResponse);
      await sendToGoogleCustomSearch(restaurants, shokuji);

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
                <p>AI: {message.ai}</p>
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
          <SearchResults searchResults={searchResults} />
        </div>
      )}
    </div>
  );
};
