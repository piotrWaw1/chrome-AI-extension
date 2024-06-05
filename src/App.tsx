import './App.css'
import {useState} from "react";

function App() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  
  const onclick = async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow:true});
    chrome.tabs.captureVisibleTab(tab.windowId, {format:'png'}, (dataUrl)=>{
      setScreenshot(dataUrl)
    })
  }

  return (
      <div>
          <button onClick={onclick}>
            Hello
          </button>
        {screenshot && <img src={screenshot} alt="Screenshot" style={{ maxWidth: '100%' }} />}
      </div>
  )
}

export default App
