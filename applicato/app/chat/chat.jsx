'use client'

import { useState } from 'react';
import axios from 'axios';

export const Chat = () => {
  const [userText, setUserText] = useState("");
  const [messages, setMessages] = useState([]);
  const [taicho, setTaicho] = useState("");
  const [arerugi, setArerugi] = useState("");
  const [kibun, setKibun] = useState("");
  const [youbou, setYoubou] = useState("");
  const [shokuji, setShokuji] = useState(""); // 新しく追加
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // 検索結果の追加

  const handleInfoSubmit = () => {
    setIsInfoSubmitted(true);
  };

  // 食事場所の情報と料理名を抽出する関数（例: 正規表現を使用）
  const extractMealInfo = (text) => {
    const placeRegex = /(?:レストラン|食堂|カフェ|ダイナー|料理屋|居酒屋|店|屋|日本|中華|イタリア|スペイン|フランス|アメリカ|インド|ネパール|タイ|韓国)\s*([^\s]+)/g;
    const dishRegex = /(?:料理|メニュー|食事|定食|セット|ランチ|ディナー|麺|飯|うどん|ラーメン|そば|蕎麦|チャーハン|つけ麵|炒飯|寿司|天ぷら|お好み焼き|しゃぶしゃぶ|すき焼き|焼き鳥|たこ焼き|味噌汁|パスタ|ピザ|ハンバーガー|ステーキ|オムレツ|フィッシュ＆チップス|ラザニア|ローストチキン|グラタン|ビーフシチュー|麻婆豆腐|餃子|北京ダック|酢豚|担々麺|春巻き|八宝菜|エビチリ|小籠包|エスカルゴ|ラタトゥイユ|ブイヤベース|キッシュ|クレームブリュレ|タルタルステーキ|フォアグラ|コンフィ・ド・カナール|ムール貝|ガレット|カルボナーラ|ボロネーゼ|マルゲリータ|リゾット|ティラミス|カプレーゼ|プロシュート|カンノーロ|ジェラート|カレー|タンドリーチキン|サモサ|ナン|チャパティ|ビリヤニ|パラクパニール|ドーサ|バターチキン|ラッシー|トムヤムクン|パッタイ|グリーンカレー|ソムタム|カオソーイ|ガイヤーン|パネーンカレー|ラープ|プーパッポンカリー|マッサマンカレー|タコス|ブリトー|エンチラーダ|ナチョス|ケサディーヤ|グアカモーレ|チリコンカーン|タマレス|サルサ|チュロス|二郎|家系|和菓子|どら焼き|大福|羊羹|団子|かりんとう|カステラ|たい焼き|もなか|クレームブリュレ|マカロン|タルトタタン|エクレア|シュークリーム|フィナンシェ|フラン|クレープ|パリブレスト|ムース|サヴァラン|ティラミス|ジェラート|カンノーロ|パンナコッタ|アフォガート|スフォリアテッラ|ババ|ビスコッティ|セミフレッド|チーズケーキ|ブラウニー|アップルパイ|ドーナツ|カップケーキ|マシュマロ|パンプキンパイ|レッドベルベットケーキ|シナモンロール|バナナスプリット|プリン|バナナスプリット|シュヴァルツヴェルダーキルシュトルテ|バウムクーヘン|シュネーバレン|レープクーヘン|ザクセンケーニッヒスシュトルーデル|プリンツレゲンテントルテ|シュマルツヌーデル|ゲベック|シュトレン|フラン|トゥロン|パステルデナタ|トルタデサンティアゴ|レチェフリータ|ロスコンデレジェス|ペロニラス|ポルボロン|ソバオ|チョコレートトリュフ|プリン|ゼリー|焼肉|うなぎ|パスタ|スパゲッティ|サラダ|唐揚げ|フライ|たまご)\s*([^\s]+)/g;

    const places = [];
    const dishes = [];

    let match;
    while ((match = placeRegex.exec(text)) !== null) {
      places.push(match[1]);
    }
    while ((match = dishRegex.exec(text)) !== null) {
      dishes.push(match[1]);
    }

    return { places, dishes };
  };

  const sendToGoogleCustomSearch = async (aiResponse) => {
    try {
      const apiKey = 'AIzaSyCvHiNBCrfLT469LR8NARnkmLhYEt_qhdA'; // Google Custom Search APIキー
      const searchEngineId = '74172df7c8b6b4031'; // 検索エンジンID

      // AIレスポンスがオブジェクトの場合、適切なフィールドを抽出
      const queryText = typeof aiResponse === 'object' ? aiResponse.text || '' : aiResponse;
      const { places, dishes } = extractMealInfo(queryText);
      if (places.length === 0 && dishes.length === 0) {
        console.log('食事場所または料理名が見つかりませんでした。');
        return;
      }
      const query = [...places, ...dishes].join(' OR '); // 複数の食事場所と料理名を OR で結合
      console.log('検索クエリ:', query); // デバッグ用

      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

      const response = await axios.get(apiUrl);
      console.log('Google Custom Search response:', response.data); // デバッグ用

      setSearchResults(response.data.items || []); // 検索結果を設定
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
      console.log('AIレスポンス:', data); // デバッグ用

      const newMessage = {
        prompt: userText,
        ai: data.ai,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setUserText("");

      // AIのレスポンスをGoogle Custom Search APIに送信
      await sendToGoogleCustomSearch(data.ai);

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
          <div>
            <h2>検索結果:</h2>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div key={index}>
                  <h3>{result.title}</h3>
                  <p>{result.snippet}</p>
                  <a href={result.link} target="_blank" rel="noopener noreferrer">リンク</a>
                </div>
              ))
            ) : (
              <p>検索結果がありません。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
