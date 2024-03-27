from flask import Flask,request,jsonify
app = Flask(__name__)

@app.route('/')
def home():
    # return jsonify({})
    pass

def process_asr(audioContent,srcLang,serviceID):
    pass

def process_nmt(textContent,srcLang,tgtLang,serviceID):
    pass

@app.route('/process',methods = ["POST","GET"])
def process_request():
    data = {}
    if request.method == "POST":
        #here i will get all the data, after that i will call process asr and process nmt ??
        data = request.json
        audioContent = data['inputData']['audio'][0]['audioContent']
        srcLang = data['pipelineTasks'][0]['config']['language']['sourceLanguage']
        tgtLang = data['pipelineTasks'][1]['config']['language']['targetLanguage']
        asrServiceID = data['pipelineTasks'][0]['config']['serviceId']
        nmtServiceID = data['pipelineTasks'][0]['config']['serviceId']
    return data

if __name__ == "__main__":
    app.run(debug=True)