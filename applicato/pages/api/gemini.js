const { GoogleGenerativeAI } = require("@google/generative-ai");



const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export default async function handler(req,res) {
  

  const {prompt} = req.body
 
  try {
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent([prompt]);
  console.log(result)
  
    
    

    // 生成されたコンテンツを取得
    const generatedText =  result.response.candidates[0].content.parts[0]


    console.log(generatedText)
    
    res.status(200).json({ai: generatedText,prompt: prompt})
  } catch (error) {
    console.error("Error:", error);
  }
}

