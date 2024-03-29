#IMPORTS
from flask import Flask,request,jsonify
from endpoints import *
import requests
from dotenv import load_dotenv, dotenv_values
import google.generativeai as genai
from pymongo import MongoClient
from bson.objectid import ObjectId
from pymongo.errors import ConnectionFailure
from bcrypt import gensalt,hashpw,checkpw

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

#GLOBAL VARIABLES
client = None
dbDetails = None
dbUserAuth = None
dbInv = None
dbStats = None
generation_config = None
safety_settings = None
model = None

#GEMINI CONFIGURATION
def setGemini():
    global generation_config,safety_settings,model

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

setGemini()

#MONGODB SETUP
def dbConnect():
    global client,dbDetails,dbInv,dbStats,dbUserAuth
    try:
        client = MongoClient(mongoURI)
        dbDetails = client.details
        dbUserAuth = dbDetails.userAuth
        dbInv = dbDetails.inventory
        dbStats = dbDetails.stats
    except ConnectionFailure as e:
        print({"Connnection Error": e})

dbConnect()

#FLASK
app = Flask(__name__)

@app.route('/')#https://localhost:5000
def home():
    # return jsonify({})
    pass

#HANDLE DATABASE
def process_db():
    pass

#HANDLE LLM - GEMINI
def process_instr(instruction, userId = '6606acd1b2642d0dc8a3f1ba'):
    '''
    Here I will work on the database -> CRUD
    '''
    if not isinstance(userId, ObjectId):
        userId = ObjectId(userId)
    
    responseGen = model.generate_content(f"{instruction}.(context: I am the shopkeeper, selling is removal and receiving is insertion)Tell me whether this instruction is corresponding to updation -> insertion or removal.Let your answer be exactly 3 words: [INSERT/REMOVE] [item_qty as a number] [item name in singular].In case of status query of any item give your response in exactly 2 words with the format : [STATUS] [item in singular]")
    
    cmdContent = responseGen.text.upper().split()

    dbOperation = cmdContent[0]
    if dbOperation == "STATUS":
        itemName = cmdContent[1]
        responseDB = dbInv.find_one({"user_id": userId, "items.item_name": itemName})
        if responseDB:
            item = next((item for item in responseDB['items'] if item['item_name'] == itemName), None)
            if item:
                if item['item_qty'] > item['item_min']:
                    return f"{item['item_qty']} of {itemName} is available"
                elif item['item_qty'] > 0 and item['item_qty'] <= item['item_min']:
                    return f"{item['item_qty']} of {itemName} is available. low on stock"
                else:
                    return f"{itemName} is out of stock"
            else:
                return f"{itemName} is not available"
        else:
            return f"{itemName} is not available"

    elif dbOperation == "INSERT":
        itemQty = int(cmdContent[1])
        itemName = cmdContent[2]
        responseDB = dbInv.find_one({"user_id": userId, "items.item_name": itemName})
        if responseDB:
            item = next((item for item in responseDB['items'] if item['item_name'] == itemName), None)
            if item:
                dbInv.update_one({"user_id": userId, "items.item_name": itemName}, {"$inc": {"items.$.item_qty": itemQty}})
                return f"{itemQty} {itemName} added to inventory"
            else:
                dbInv.update_one({"user_id": userId}, {"$push": {"items": {"item_name": itemName, "item_qty": itemQty, "item_min": 10}}})
                return f"{itemQty} {itemName} added to inventory"
        else:
            dbInv.insert_one({"user_id": userId, "items": [{"item_name": itemName, "item_qty": itemQty, "item_min": 10}]})
            return f"{itemQty} {itemName} added to inventory"

    return {"cmd": cmdContent}

#HANDLE BHASHINI TASKS
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

def process_ocr():
    pass

@app.route('/process',methods = ["POST"])#https://localhost:5000/process
def process_request():
    data = {}#should comprise of sourceLang, TargetLang
    try:
        if request.method == "POST":
            data = request.json
            srcLang = data.get("sourceLanguage", "")
            tgtLang = data.get("targetLanguage", "")
            audioContent = data.get("audioContent", "")
            imageUri = data.get("imageUri", "")

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
        ocrServiceId = "bhashini-anuvaad-tesseract-ocr-printed-line-all"#this is the only given ocr service ID

        responseAsrNmt = process_asr_nmt(audioContent=audioContent,srcLang=srcLang,tgtLang=tgtLang,asrServiceId=asrServiceId,nmtServiceId=nmtServiceId)

        getCmd= responseAsrNmt["pipelineResponse"][1]["output"][0]["target"]
        
        
        return process_instr(instruction=getCmd)
        # responseDB = process_instr(instruction=genCmd)

        responseNmtTts = process_nmt_tts(textContent = "Sold ten Bananas.",srcLang=tgtLang,tgtLang=srcLang,ttsServiceId=ttsServiceId,nmtServiceId=nmtServiceId)
        # return {"op":responseNmtTts}
        
        
    #post request will be made to api -> response from that will be then processes by me to my LLM -> classification of received comamnd, prompt will be a mapping prompt -> this will in turn make a call to handle the database in some manner

#HANDLE LOGIN SIGNUP
@app.route('/signup',methods=["POST"])
def signup():
    if request.method == "POST":
        credentials = request.json
        username = credentials["username"]
        pwd = credentials["password"]
        salt = gensalt()
        hashedPwd = hashpw(pwd.encode('utf-8'),salt)
        #here i should encrypt the pwd
        email = credentials["email"]
        language = credentials["language"]
        mobileNo = credentials["mobile_no"]
    authCreds = {"username":username,"password":hashedPwd,"email":email,"language":language,"mobile_no":mobileNo}

    existing_user = dbUserAuth.find_one({"$or": [{"username": username}, {"email": email}, {"mobile_no": mobileNo}]})
    if existing_user:
            return jsonify({"error": "Username, email, or mobile number already exists"}), 400

    result = dbUserAuth.insert_one(authCreds)
    user_id = result.inserted_id

    invCreds = {"items":[],"user_id":user_id}
    statCreds = {"statistics":{},"user_id":user_id}

    dbInv.insert_one(invCreds)
    dbStats.insert_one(statCreds)

    return jsonify({"message": "User created successfully"}), 201



@app.route('/login',methods=["POST"])
def login():
    if request.method == "POST":
        credentials = request.json
        username = credentials["username"]
        pwd = credentials["password"]

        user = dbUserAuth.find_one({"username": username})
        if user:
            userPwd = user["password"]
            if checkpw(pwd.encode('utf-8'),userPwd):
                return jsonify({"message": "Login successful"}), 200
            else:
                return jsonify({"error": "Incorrect password"}), 401
        else:
            return jsonify({"error": "User not found"}), 404
    
    #can globally set the db to its documents
    
if __name__ == "__main__":
    app.run(debug=True)