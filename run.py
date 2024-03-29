#IMPORTS
from flask import Flask,request,jsonify
from endpoints import *
import requests
from dotenv import load_dotenv, dotenv_values
import pathlib
import textwrap
import google.generativeai as genai
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

#ENVIRONMENT VARIABLES
load_dotenv()

env_var = dotenv_values(".env")
userID = env_var.get("USER_ID")
ulcaApiKey = env_var.get("ULCA_API_KEY")
pipelineId = env_var.get("PIPELINE_ID")
computeAuthKey = env_var.get("COMPUTE_AUTHORIZATION_KEY")
computeAuthValue = env_var.get("COMPUTE_AUTHORIZATION_VALUE")
mongoURI = env_var.get("MONGODB_URI")
geminiApiKey = env_var.get("GEMINI_API_KEY")

#GEMINI CONFIGURATION
genai.configure(api_key=geminiApiKey)

generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]

model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

#MONGODB SETUP
try:
    client = MongoClient(mongoURI)
    dbDetails = client.details
    dbUserAuth = dbDetails.userAuth
    dbInv = dbDetails.inventory
    dbStats = dbDetails.stats
except ConnectionFailure as e:
    print({"Connnection Error": e})

#FLASK
app = Flask(__name__)

@app.route('/')#https://localhost:5000
def home():
    # return jsonify({})
    pass

def process_db():
    pass

def process_instr(instruction):
    '''
    Here I will work on the database -> CRUD
    '''
    responseGen = model.generate_content(f"{instruction}.(context: I am the shopkeeper, selling is removal and receiving is insertion)Tell me whether this instruction is corresponding to updation -> insertion or removal. Let your answer be exactly 3 words: [INSERT/REMOVE] [quantity as a number] [item name in singular]")
    
    cmdContent = responseGen.text.upper().split()

    dbOperation = cmdContent[0]

    

    return {"cmd":cmdContent}



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

        responseAsrNmt = requests.post(ASR_NMT_TTS_ENDPOINT,json=reqPayload,headers=headers)

    
    except Exception as e:
        return {"error":str(e)},500
    
    finally:
        return responseAsrNmt.json()
        

def process_nmt_tts(textContent,srcLang,tgtLang,ttsServiceId,nmtServiceId):
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
                        "sourceLanguage": srcLang
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
                    "source": textContent
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

        responseNmtTts = requests.post(ASR_NMT_TTS_ENDPOINT,json=reqPayload,headers=headers)
    except Exception as e:
        return {"error":str(e)},500
    finally:
        return responseNmtTts.json()

def process_ocr():#optical character recognition
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
        ttsServiceId = responseServices.json()["pipelineResponseConfig"][2]["config"][0]["serviceId"]#this correctly gives the tts service ID to us
    
        responseAsrNmt = process_asr_nmt(audioContent=audioContent,srcLang=srcLang,tgtLang=tgtLang,asrServiceId=asrServiceId,nmtServiceId=nmtServiceId)

        getCmd= responseAsrNmt["pipelineResponse"][1]["output"][0]["target"]
        
        
        return process_instr(instruction=getCmd)
        # responseDB = process_instr(instruction=genCmd)

        responseNmtTts = process_nmt_tts(textContent = "Sold ten Bananas.",srcLang=tgtLang,tgtLang=srcLang,ttsServiceId=ttsServiceId,nmtServiceId=nmtServiceId)
        # return {"op":responseNmtTts}
        
        
    #post request will be made to api -> response from that will be then processes by me to my LLM -> classification of received comamnd, prompt will be a mapping prompt -> this will in turn make a call to handle the database in some manner


if __name__ == "__main__":
    app.run(debug=True)