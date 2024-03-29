#IMPORTS
from flask import Flask,request,jsonify
from endpoints import *
import requests
from dotenv import load_dotenv, dotenv_values


#ENVIRONMENT VARIABLES
load_dotenv()

env_var = dotenv_values(".env")
userID = env_var.get("USER_ID")
ulcaApiKey = env_var.get("ULCA_API_KEY")
pipelineId = env_var.get("PIPELINE_ID")
computeAuthKey = env_var.get("COMPUTE_AUTHORIZATION_KEY")
computeAuthValue = env_var.get("COMPUTE_AUTHORIZATION_VALUE")

#FLASK 
app = Flask(__name__)

@app.route('/')#https://localhost:5000
def home():
    # return jsonify({})
    pass

def process_asr_nmt(audioContent,srcLang,tgtLang,asrServiceId,nmtServiceId):
    try:
        pipelineTasks = [
            {
                "taskType": "asr",
                "config": {
                    "language": {
                        "sourceLanguage": srcLang
                    },
                    "serviceId": asrServiceId,
                    "audioFormat": "flac",
                    "samplingRate": 16000
                }
            },
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": srcLang,
                        "targetLanguage": tgtLang
                    },
                    "serviceId": nmtServiceId
                }
            }
        ]
        
        inputData = {
            "audio": [
                {
                    "audioContent": audioContent
                }
            ]
        }

        reqPayload = {
            "pipelineTasks": pipelineTasks,
            "inputData": inputData
        }

        headers = {
            computeAuthKey:computeAuthValue
        }

        responseAsrNmt = requests.post(ASR_NMT_ENDPOINT,json=reqPayload,headers=headers)

    
    except Exception as e:
        return {"error":str(e)},500
    
    finally:
        return responseAsrNmt.json()
        

def process_nmt_tts(sampleInput,srcLang,tgtLang,ttsServiceId,nmtServiceId):
    try:
        pipelineTasks = [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": srcLang,
                        "targetLanguage": tgtLang
                    },
                    "serviceId": nmtServiceId
                }
            },
            {
                "taskType": "tts",
                "config": {
                    "language": {
                        "sourceLanguage": tgtLang
                    },
                    "serviceId": ttsServiceId,
                    "gender": "female",
                    "samplingRate": 8000
                }
            }
        ]
        
        inputData = {
            "input": [
                {
                    "source": sampleInput
                }
            ]
        }
        
        reqPayload = {
            "pipelineTasks": pipelineTasks,
            "inputData": inputData
        }

        headers = {
            computeAuthKey:computeAuthValue
        }

        responseNmtTts = requests.post(NMT_TTS_ENDPOINT,json=reqPayload,headers=headers)
    except Exception as e:
        return {"error":str(e)},500
    finally:
        return responseNmtTts.json()

def process_ocr():
    pass

@app.route('/process',methods = ["POST"])#https://localhost:5000/process
def process_request():
    data = {}#should comprise of sourceLang, TargetLang
    try:
        if request.method == "POST":
            data = request.json
            srcLang = data["sourceLanguage"]
            tgtLang = data["targetLanguage"]
            audioContent = data["audioContent"]

        headers={
            "userID":userID,
            "ulcaApiKey":ulcaApiKey
        }

        pipelineTasks = [
                {
                    "taskType": "asr",
                    "config": {
                        "language": {
                            "sourceLanguage": srcLang
                        }
                    }
                },
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": srcLang,
                            "targetLanguage": tgtLang
                        }
                    }
                },
                {
                    "taskType": "tts",
                    "config": {
                        "language": {
                            "sourceLanguage": tgtLang
                        }
                    }
                }
            ]

        
        pipelineRequestConfig = {
                "pipelineId": pipelineId
            }

        langPayload = {
                "pipelineTasks": pipelineTasks,
                "pipelineRequestConfig": pipelineRequestConfig
            }

        responseServices = requests.post(GET_SERVICE_ENDPOINT,json=langPayload,headers=headers)

        

    except Exception as e:
        return {"error":str(e)},500
        
    finally:
        
        asrServiceId = responseServices.json()["pipelineResponseConfig"][0]["config"][0]["serviceId"]#this correctly gives the asr service ID to us
        nmtServiceId = responseServices.json()["pipelineResponseConfig"][1]["config"][0]["serviceId"]#this correctly gives the nmt service ID to us
        ttsserviceID = responseServices.json()["pipelineResponseConfig"][2]["config"][0]["serviceId"]#this correctly gives the tts service ID to us
        # tempresp = {"asr": asrServiceId,"nmt":nmtServiceId,"audio":audioContent}
        # return tempresp
    
        #return process_asr_nmt(audioContent=audioContent,srcLang=srcLang,tgtLang=tgtLang,asrServiceId=asrServiceId,nmtServiceId=nmtServiceId)
        return process_nmt_tts(sampleInput="Hello",srcLang=srcLang,tgtLang=tgtLang,ttsServiceId=ttsserviceID,nmtServiceId=nmtServiceId)

    #post request will be made to api -> response from that will be then processes by me to my LLM -> classification of received comamnd, prompt will be a mapping prompt -> this will in turn make a call to handle the database in some manner


if __name__ == "__main__":
    app.run(debug=True)