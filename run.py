from flask import Flask,request,jsonify
app = Flask(__name__)

@app.route('/')#https://localhost:5000
def home():
    # return jsonify({})
    pass

def process_asr(audioContent,srcLang,serviceID):
    pass

def process_nmt(textContent,srcLang,tgtLang,serviceID):
    pass

@app.route('/process',methods = ["POST","GET"])#https://localhost:5000/process
def process_request():
    data = {}
    if request.method == "POST":
        #here i will get all the data, after that i will call process asr and process nmt ??
        data = request.json
        # audioContent = data['inputData']['audio'][0]['audioContent']
        # srcLang = data['pipelineTasks'][0]['config']['language']['sourceLanguage']
        # tgtLang = data['pipelineTasks'][1]['config']['language']['targetLanguage']
        # asrServiceID = data['pipelineTasks'][0]['config']['serviceId']
        # nmtServiceID = data['pipelineTasks'][0]['config']['serviceId']
        # pass
        name = data["name"]

    return data

    #post request will be made to api -> response from that will be then processes by me to my LLM -> classification of received comamnd, prompt will be a mapping prompt -> this will in turn make a call to handle the database in some manner
if __name__ == "__main__":
    app.run(debug=True)