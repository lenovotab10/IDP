import assemblyai as aai

def Transcribe(FILE_URL):
    aai.settings.api_key = "87ee4831c47b4aa682f48f57f3bd5db0"
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(FILE_URL)

    if transcript.status == aai.TranscriptStatus.error:
        return transcript.error
    else:
        return transcript.text
    