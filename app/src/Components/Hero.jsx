"use client";
import { useEffect, useState } from "react";
import { Mic, StopCircle, Upload } from "lucide-react";
import useSpeechToText from "react-hook-speech-to-text";
import "./Hero.css";

export default function Hero() {
  const [inputType, setInputType] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [convertedText, setConvertedText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [status, setStatus] = useState(false);
  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const GetResult = async (inputText) => {
    const url = "http://localhost:5000/predict";
    const data = {
      input: inputText,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    setStatus(true);
    fetch(url, options)
      .then((res) => res.json())
      .then((x) => {
        setStatus(false);
        setPrediction(x.prediction);
      })
      .catch((err) => {
        setStatus(false);
        console.error("Error:", err);
      });
  };

  useEffect(() => {
    inputType === "audio" ? setDescriptionText("") : setConvertedText("");
  }, [prediction]);

  useEffect(() => {
    if (results.length > 0) {
      const newTranscript = results
        .map((result) => result.transcript)
        .join(" ");
      setConvertedText(newTranscript);
    }
  }, [results]);

  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      setConvertedText("");
      setResults([]);
      startSpeechToText();
    }
  };

  const handleTextChange = (event) => {
    setDescriptionText(event.target.value);
    setPrediction(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedText("");
    }
  };

  const handleFileDelete = () => {
    setFile(null);
  };

  const handleProcessAudio = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("audio", file);

      const url = "http://localhost:5000/audio/convert";
      const data = {
        audio: "file",
      };
      // const response = await fetch(url, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(data),
      // });
      try {
        setProcessing(true);
        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log(result);
          setProcessing(false);
          setConvertedText(result.text);
        } else {
          console.error("Error Coverting Audio");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("No file Selected");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputType == "audio") {
      GetResult(convertedText);
    } else {
      GetResult(descriptionText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6">
          AI-Powered Disease Detection
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
          Describe your symptoms through audio or text, and our advanced AI will
          help identify potential health issues.
        </p>
      </main>
      <div className="button-container">
        <button
          className="button flex justify-center items-center"
          onClick={() => {
            setInputType("audio");
            setPrediction("");
          }}
        >
          <span role="img" aria-label="mic" className="mic-icon">
            🎙️
          </span>
          Audio
        </button>
        <button
          className="button flex justify-center items-center"
          onClick={() => {
            setInputType("text");
            setPrediction("");
          }}
        >
          <span role="img" aria-label="mic" className="keyboard-icon mb-2 ">
            ⌨️
          </span>
          Enter Text
        </button>
      </div>
      <div className=" py-10 px-4 sm:px-6 lg:px-8">
        {inputType && (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Provide Your Symptom Data
              </h2>
              <form onSubmit={handleSubmit}>
                {inputType && (
                  <div className="mb-4">
                    <label className="block text-md font-medium text-gray-700">
                      {inputType === "audio"
                        ? "Describe your symptoms through audio "
                        : "Describe your symptoms through text "}
                    </label>

                    <div className="mt-2 flex items-center gap-4">
                      {inputType === "audio" && (
                        <>
                          <button
                            type="button"
                            onClick={StartStopRecording}
                            className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                              isRecording
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-orange-400 text-white hover:bg-orange-500"
                            }`}
                          >
                            {isRecording ? (
                              <h2 className="animate-pulse flex gap-2 items-center">
                                <StopCircle />
                                Stop Recording
                              </h2>
                            ) : (
                              <h2 className="text-primary flex gap-2 items-center">
                                <Mic className="w-5 h-5 mr-2" />
                                Record Audio
                              </h2>
                            )}
                          </button>
                          <button
                            type="button"
                            className="flex items-center justify-center px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-orange-400 hover:bg-orange-500"
                            onClick={() =>
                              document.getElementById("audio-upload").click()
                            }
                          >
                            <Upload className="w-6 h-6 mr-2" />
                            Upload Audio
                          </button>
                          <input
                            id="audio-upload"
                            type="file"
                            className="sr-only"
                            onChange={(event) => {
                              handleFileChange(event);
                              event.target.value = null;
                            }}
                            accept="audio/*"
                            name="audiofile"
                          />

                          {file && (
                            <>
                              <button
                                type="button"
                                onClick={handleProcessAudio}
                                className={
                                  "flex items-center justify-center px-4 py-2 border rounded-md bg-green-500 text-white"
                                }
                              >
                                Proceed
                              </button>
                              <button
                                type="button"
                                onClick={handleFileDelete}
                                className={
                                  "flex items-center justify-center px-4 py-2 border rounded-md bg-red-500 text-white"
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {inputType === "text" && (
                        <textarea
                          id="descriptionText"
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          value={descriptionText}
                          onChange={handleTextChange}
                          placeholder="Write here"
                        />
                      )}
                    </div>
                    {inputType === "audio" && (
                      <>
                        {convertedText && (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mt-5 mb-3">
                              Converted Text
                            </label>
                            <textarea
                              id="convertedText"
                              rows={5}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                              value={convertedText}
                              onChange={(e) => setConvertedText(e.target.value)}
                              placeholder="Converting..."
                            />
                          </>
                        )}
                        {file && (
                          <>
                            <p className="mt-2 text-sm text-gray-500">
                              File selected: {file.name}
                            </p>
                            {processing && (
                              <div className="flex justify-center">
                                <button
                                  disabled
                                  type="button"
                                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                                >
                                  <svg
                                    aria-hidden="true"
                                    role="status"
                                    className="inline w-4 h-4 me-3 text-white animate-spin"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                      fill="#E5E7EB"
                                    />
                                    <path
                                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                  Converting...
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {((descriptionText && inputType == "text") ||
                  (convertedText && inputType == "audio")) && (
                  <div className="flex justify-center mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Predict
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
      {status && (
        <div role="status" className="flex justify-center">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {prediction && (
        <div className="bg-green-200 max-w-3xl mx-auto rounded-lg p-3 mb-5">
          <h1 className="text-4xl">
            You might have symptoms of :{" "}
            <span className="font-semibold">{prediction}</span>
          </h1>
        </div>
      )}

      <footer className="text-center pb-6 text-gray-600">
        © {new Date().getFullYear()} AI Disease Detection. All rights reserved.
      </footer>
    </div>
  );
}
