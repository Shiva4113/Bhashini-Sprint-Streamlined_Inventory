#IMPORTS
from flask import Flask,request,jsonify
from endpoints import *
import requests
from dotenv import load_dotenv, dotenv_values



load_dotenv()

app = Flask(__name__)

@app.route('/')#https://localhost:5000
def home():
    # return jsonify({})
    pass

def process_asr(audioContent,srcLang,serviceID):
    pass

def process_nmt(textContent,srcLang,tgtLang,serviceID):
    pass

def process_tts():
    pass

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

            #load the environment variables
            env_var = dotenv_values(".env")
            userID = env_var.get("USER_ID")
            ulcaApiKey = env_var.get("ULCA_API_KEY")
            pipelineId = env_var.get("PIPELINE_ID")

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

        #task based service extraction

    except Exception as e:
        return {"error":str(e)},500
        
    finally:
        return responseServices.json()

    #post request will be made to api -> response from that will be then processes by me to my LLM -> classification of received comamnd, prompt will be a mapping prompt -> this will in turn make a call to handle the database in some manner
if __name__ == "__main__":
    app.run(debug=True)