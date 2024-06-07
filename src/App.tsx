import './App.css'
import {useEffect, useState} from "react";
import OpenAI from "openai";

function App() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const AI = new OpenAI({apiKey: import.meta.env.VITE_AI_KEY, dangerouslyAllowBrowser: true})

  const onclick = async () => {
    setLoading(true)
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, (dataUrl) => {
      setScreenshot(dataUrl)
    })
  }

  useEffect(() => {
    const getText = async () => {
      if (screenshot) {
        const response = await AI.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Podawaj poprawne odpowiedzi na pytania bez wyjaśniania możliwie jak naj krócej."
            },
            {
              role: "user",
              content: [
                {type: "text", text: "Zaznacz poprawną odpowiedz."},
                {
                  type: "image_url", image_url: {
                    "url": screenshot
                  }
                }
              ]
            }
          ]
        })
        if(response.choices[0].message.content){
          setAnswer(response.choices[0].message.content)
        }else{
          setAnswer("Answer Error")
        }
      }
      setLoading(false)
    }
    if(screenshot){
      getText().then()
      setScreenshot(null)
    }
  }, [AI.chat.completions, screenshot]);


  return (
      <div>
        <button disabled={loading} onClick={onclick}>
          Get answers
        </button>
        <p><b>{answer}</b></p>
      </div>
  )
}

export default App
