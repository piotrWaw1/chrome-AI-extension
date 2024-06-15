import './App.css'
import {useCallback, useEffect} from "react";
import OpenAI from "openai/index";
import {createClient} from "@supabase/supabase-js";


function App() {
  const AI = new OpenAI({apiKey: import.meta.env.VITE_AI_KEY, dangerouslyAllowBrowser: true})
  const supabaseClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

  const inputInHTML = (tab: chrome.tabs.Tab, answer: string) => {
    if (tab.id) {
      chrome.scripting.executeScript({
        args: [answer],
        target: {tabId: tab.id},
        func: (answer) => {
          const div = document.createElement('div');

          div.style.color = "rgba(0, 0, 0, 0)";
          div.style.transition = "color 0.0s ease";

          div.addEventListener('mouseover', () => {
            div.style.color = "rgba(0, 0, 0, 1)";
          });

          div.addEventListener('mouseout', () => {
            div.style.color = "rgba(0, 0, 0, 0)";
          });
          console.log(answer)
          div.innerText = answer
          document.body.appendChild(div);
        }
      }).then()
    } else {
      console.log('tabError')
    }
  }

  const saveImg = useCallback(async (img: string) => {
    await supabaseClient.from('pictures').insert({picture: img})
    console.log("Image save done")
  }, [supabaseClient])


  const getText = useCallback(async (img: string, tab: chrome.tabs.Tab) => {
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
                "url": img
              }
            }
          ]
        }
      ]
    })

    // response.choices[0].message.content
    if (response.choices[0].message.content) {
      // navigator.clipboard.writeText(response.choices[0].message.content).then(() => {
      //   console.log('Answer copied to clipboard');
      // }).catch(err => {
      //   console.error('Failed to copy to clipboard:', err);
      // });
      inputInHTML(tab, response.choices[0].message.content)
    } else {
      inputInHTML(tab, "Answer Error")
    }
    console.log("AI response done")
  }, [AI.chat.completions])


  useEffect(() => {
    const start = async () => {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, (dataUrl) => {
        console.log('screen')
        console.log("saveImg")
        saveImg(dataUrl).then()
        console.log("AI answer")
        getText(dataUrl, tab).then()
      })
    }
    start().then()
  }, [getText, saveImg]);

  return null
}

export default App