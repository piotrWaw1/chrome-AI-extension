import './App.css'
import {useEffect, useState} from "react";
import OpenAI from "openai";

function App() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const AI = new OpenAI({apiKey: import.meta.env.VITE_AI_KEY, dangerouslyAllowBrowser: true})


  useEffect(() => {
    const getText = async () => {
      if (screenshot) {
        const response = await AI.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Podaj poprawne odpowiedzi na pytania bez wyjaśniania możliwie jak najkrócej."
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

          navigator.clipboard.writeText(response.choices[0].message.content).then(() => {
            console.log('Answer copied to clipboard');
          }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
          });

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

  const onClick = async () => {
    setLoading(true)

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, (dataUrl) => {
      setScreenshot(dataUrl)
    })
  }

  return (
      <div>
        <button disabled={loading} onClick={onClick}>
          Get answers
          {!loading ? " ( ͡° ͜ʖ ͡°)" : " ( ͡~ ͜ʖ ͡°)"}
        </button>
        <p><b>{answer}</b></p>
      </div>
  )
}
export default App