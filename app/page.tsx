"use client"; // クライアントコンポーネント

import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState(""); // 検索キーワードの管理
  const [restaurants, setRestaurants] = useState([]); // 検索結果の管理
  const [loading, setLoading] = useState(false); // ローディング状態の管理

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?keyword=${keyword}`);
      const data = await response.json();
  
      // APIレスポンスの内容を確認
      console.log("API Response:", data);
  
      // APIエラーがある場合
      if (data.results && data.results.error) {
        console.error('API Error:', data.results.error);  // エラーの詳細を表示
        return;
      }
  
      if (data.results && data.results.shop) {
        setRestaurants(data.results.shop);  // 正常なレスポンスがあればセット
      } else {
        setRestaurants([]);  // レストラン情報がない場合は空の配列
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);  // キャッチされたエラーを表示
      setRestaurants([]);  // エラーハンドリングで空の配列をセット
    }
    setLoading(false);
  };  

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants(); // 検索ボタンを押したときの処理
  };

  return (
    <div>
      <h1>Restaurant Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter a keyword..."
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {Array.isArray(restaurants) && restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <li key={restaurant.id}>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.address}</p>
              </li>
            ))
          ) : (
            <p>No restaurants found.</p> // レストランが見つからない場合
          )}
        </ul>
      )}
    </div>
  );
}
