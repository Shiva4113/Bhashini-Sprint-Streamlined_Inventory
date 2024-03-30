#IMPORTS
from flask import Flask,request,jsonify
from endpoints import *
import requests
from dotenv import load_dotenv, dotenv_values
import google.generativeai as genai
from pymongo import MongoClient
from bson import ObjectId, json_util
from pymongo.errors import ConnectionFailure
from bcrypt import gensalt,hashpw,checkpw
import json
from pathlib import Path


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
modelText = None
modelVision = None

#parse json
def parse_json(data):
    return json.loads(json_util.dumps(data))


#GEMINI CONFIGURATION
def setGemini():
    global generation_config,safety_settings,modelText, modelVision

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

    modelText = genai.GenerativeModel(model_name="gemini-1.0-pro",
                                generation_config=generation_config,
                                safety_settings=safety_settings)

    modelVision = genai.GenerativeModel(model_name="gemini-pro-vision",
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

# @app.route('/')#https://localhost:5000
# def home():
   

#HANDLE DB with LLM - GEMINI
def process_instr(instruction, userId):

    replyToUser = ""

    if not isinstance(userId, ObjectId):
        userId = ObjectId(userId)
    
    responseGen = modelText.generate_content(f'''{instruction}.(context: I am the shopkeeper, selling is removal and receiving is insertion)
    For anything related to selling : REMOVE
    For anything related to receiving : INSERT
    For anything that checks for item properties : STATUS

    examples :  2 Onions 3 Bananas sold : REMOVE;[2,3];[Onion, Banana]
	            2 Apple sold : REMOVE;[2];[Apple]
                sold 3 bananas and 2 onions : REMOVE;[3,2];[Banana, Onion]

	            3 Mangos received : INSERT;[3];[Mango] 
	            4 Potato Chips obtained : INSERT;[4];[Potato Chips] 

	What is the price of Banana? : STATUS;PRICE;[Banana]
	How many apples are left? : STATUS;QUANTITY;[Apple]
    How many apples and bananas are there?: STATUS;QUANTITY;[Apple, Banana]
    Keep the item quantities in one list and the itemNames in another list, dont separate them''')
    
    
    cmdContent = responseGen.text.upper().split(';')
    # return {"response":cmdContent}
    # itemQtys = list(map(int,cmdContent[1].strip('[').strip(']').split(',')))
    itemNames = list(map(str,cmdContent[2].strip('[').strip(']').split(',')))
    # return {"response":[itemNames,itemQtys]}
    dbOperation = cmdContent[0]
    responseDB = dbInv.find_one({"user_id": userId})

    if dbOperation == "INSERT":
            itemQtys = list(map(int,cmdContent[1].strip('[').strip(']').split(',')))
            if responseDB:
                for itemName,itemQty in zip(itemNames,itemQtys):
                    itemName = itemName.lstrip().capitalize()
                    item_exists = False
                    for item in responseDB['items']:
                        if item['item_name'] == itemName:
                            dbInv.update_one(
                                {"_id": responseDB['_id'], "items.item_name": itemName},
                                {"$inc": {"items.$.item_qty": itemQty}}
                            )
                            item_exists = True
                            if item['item_max'] <= item["item_qty"]+itemQty:
                                replyToUser+= f"{itemQty} {itemName} added. {itemName} maximum limit reached. "
                            else:
                                replyToUser+= f"{itemQty} {itemName} added. "
                    if not item_exists:
                        dbInv.update_one(
                            {"_id": responseDB['_id']},
                            {"$push": {"items": {"item_name": itemName, "item_qty": itemQty, "item_min":0,"item_max":100,"item_price":0.0}}}
                        )
                        replyToUser+= f"{itemQty} {itemName} inserted. Please update the minimum limit, maximum limit and price. "
                        
                
            else:
                replyToUser+= "User not found"

    elif dbOperation == "REMOVE":
        itemQtys = list(map(int,cmdContent[1].strip('[').strip(']').split(',')))
        if responseDB:
            for itemName,itemQty in zip(itemNames,itemQtys):
                itemName = itemName.lstrip().capitalize()
                item_exists = False
                for item in responseDB['items']:
                    if item['item_name'] == itemName:
                        item_exists = True
                        if item['item_qty'] >= itemQty:
                            dbInv.update_one(
                                {"_id": responseDB['_id'], "items.item_name": itemName},
                                {"$inc": {"items.$.item_qty": -itemQty}}
                            )
                            if item['item_qty']-itemQty <= item['item_min']:
                                replyToUser+= f"Sold {itemQty} {itemName} . Less {itemName} available."
                            else:
                                replyToUser += f"Sold {itemQty} {itemName} ."
                        else:
                            replyToUser += f"{itemName} is currently over. "
                
                if not item_exists:
                    replyToUser+= f"{itemName} was not found. "
        else:
                replyToUser+= "User not found. "

        

    elif dbOperation == "STATUS":
        itemParam = cmdContent[1]
        # itemNames = list(map(str,cmdContent[2].strip('[').strip(']').split(',')))
        # responseDB = dbInv.find_one({"user_id": userId, "items.item_name": itemName})
        if responseDB:
            if itemParam == "QUANTITY":
                for itemName in itemNames:
                    itemName = itemName.lstrip().capitalize()
                    item = next((item for item in responseDB['items'] if item['item_name'] == itemName), None)
                    if item:
                        if item['item_qty'] > item['item_min']:
                            replyToUser+=  f"{item['item_qty']} of {itemName} is available. "
                        elif item['item_qty'] > 0 and item['item_qty'] <= item['item_min']:
                            replyToUser+=  f"{item['item_qty']} of {itemName} is available. {itemName} Quantity is Low. "
                        else:
                            replyToUser+=  f"{itemName} is currently over. "
                    else:
                        replyToUser+=  f"{itemName} is not available. "

            elif itemParam == "PRICE":
                for itemName in itemNames:
                    itemName = itemName.lstrip().capitalize()
                    item = next((item for item in responseDB['items'] if item['item_name'] == itemName), None)
                    if item:
                        replyToUser+= f"{itemName} price is {item['item_price']}. "
                    else:
                        replyToUser+=  f"{itemName} is not available. "
            else:
                replyToUser+=  "User not found"
    reply = {"response":replyToUser}

    return reply

def process_img():
    
    imgPath = Path("./temp/image.jpeg")
    imgConf = {
        "mime/type": "image/jpeg",
        "data": imgPath.read_bytes()
    }

    prompt = ['''how many of each object is present in the image?
                 can you give me the output as 
                 example : 
                 for an image with 2 onions and 3 bananas: REMOVE;[2,3];[Onion, Banana] 
                 for an image with 1 apple : REMOVE;[1];[Apple]''',
            imgConf]

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

def process_ocr(srcLang,imgUri,ocrServiceId):
    try:
        pipelineTasks = [
            {
                "taskType": "ocr",
                "config": {
                    "language": {
                        "sourceLanguage": srcLang
                    },
                    "serviceId": ocrServiceId
                }
            }
        ]
        
        inputData = {
            "image": [
                {
                "imageUri": imgUri
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
        
        responseOcr = requests.post(ASR_NMT_TTS_ENDPOINT,json=reqPayload,headers=headers)
        
    except Exception as e:
        return {"error":str(e)},500
    finally:
        return responseOcr.json()

#OVERALL PROCESS
@app.route('/processaudio',methods = ["POST"])#https://localhost:5000/process
def process_audio_request():
    data = {}#should comprise of sourceLang, TargetLang
    try:
        if request.method == "POST":
            data = request.json
            srcLang = data.get("sourceLanguage", "")
            tgtLang = data.get("targetLanguage", "")
            audioContent = data.get("audioContent", "")
            imageUri = data.get("imageUri", "")
            user_id = data.get("userId","")

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
        
        
        responseLLM= process_instr(instruction=getCmd,userId=user_id)

        # return responseLLM
            
        responseNmtTts = process_nmt_tts(textContent = responseLLM["response"],srcLang=tgtLang,tgtLang=srcLang,ttsServiceId=ttsServiceId,nmtServiceId=nmtServiceId)

        return responseNmtTts
        # responseocr = process_ocr(srcLang=srcLang,imgUri="https://dhruvacentrali0960249713.blob.core.windows.net/haridas/Hindi-Bhasha.jpg",ocrServiceId=ocrServiceId)
        #return {"op":responseocr}
        
    #post request will be made to api -> response from that will be then processes by me to my LLM -> classification of received comamnd, prompt will be a mapping prompt -> this will in turn make a call to handle the database in some manner


@app.route('/processimage',methods = ["POST"])
def process_image_request():
    data = {}
    #try except finally here -> get the response -> nmt tts -> to user 
#HANDLE LOGIN/SIGNUP
@app.route('/signup',methods=["POST"])
def signup():
    if request.method == "POST":
        credentials = request.json
        username = credentials["username"]
        pwd = credentials["password"]
        salt = gensalt()
        hashedPwd = hashpw(pwd.encode('utf-8'),salt)
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
                globals(logged_in_user = user["_id"])
                return jsonify({"message": "Login successful"}), 200
            else:
                return jsonify({"error": "Incorrect password"}), 401
        else:
            return jsonify({"error": "User not found"}), 404
    
    #can globally set the db to its documents
    

#HANDLE USER AUTH CHANGES
@app.route('/changepassword',methods=["POST"])
def change_password():
    if request.method == "POST":
        credentials = request.json
        username = credentials["username"]
        pwd = credentials["password"]
        newPwd = credentials["new_password"]

        user = dbUserAuth.find_one({"username": username})
        if user:
            userPwd = user["password"]
            if checkpw(pwd.encode('utf-8'),userPwd):
                salt = gensalt()
                hashedPwd = hashpw(newPwd.encode('utf-8'),salt)
                dbUserAuth.update_one({"username": username}, {"$set": {"password": hashedPwd}})
                return jsonify({"message": "Password changed successfully"}), 200
            else:
                return jsonify({"error": "Incorrect password"}), 401
        else:
            return jsonify({"error": "User not found"}), 404
        

@app.route('/changelanguage',methods=["POST"])
def change_language():
    if request.method == "POST":
        credentials = request.json
        username = credentials["username"]
        language = credentials["language"]

        user = dbUserAuth.find_one({"username": username})
        if user:
            dbUserAuth.update_one({"username": username}, {"$set": {"language": language}})
            return jsonify({"message": "Language changed successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404

#INVENTORY UPDATES        
@app.route('/fetchinv',methods = ["POST"])
def get_inventory():
    responseDB = {}
    if request.method == "POST":
        credentials = request.json
        userId = credentials.get("userId", "")

        if userId:
            if not isinstance(userId, ObjectId):
                userId = ObjectId(userId)
        
        responseDB = dbInv.find_one({"user_id": userId})

        items = responseDB['items']

        responseItems =  {"items":items}

        return responseItems
    
    
@app.route('/updateinv', methods= ["POST"])
def update_inventory():
    responseDB = {}
    if request.method == "POST":
        credentials = request.json
        userId = credentials.get("userId","")
        items = credentials.get("items","")

    if userId:
        if not isinstance(userId, ObjectId):
            userId = ObjectId(userId)

    responseDB = dbInv.find_one({"user_id":userId})

    result = dbInv.update_one(
            {"user_id": userId},
            {"$set": {"items": items}},
        )

    if result.modified_count > 0:
            response = {"message": "Items updated successfully"}
    else:
            response = {"message": "No document found with the provided userId or items not updated"}
        
    return response
        
if __name__ == "__main__":
    app.run(debug=True)