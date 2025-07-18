
require("dotenv").config();

const {GoogleGenAI}=require("@google/genai");
const router = require("express").Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/generate",async(req,res)=>{
  const {prompt}=req.body;
    const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  res.json({response:response.text})

})

module.exports=router;

