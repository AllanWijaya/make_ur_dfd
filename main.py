from fastapi.middleware.cors import CORSMiddleware
from flair.data import Sentence
from flair.nn import Classifier
from fastapi import FastAPI


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://make-ur-dfd.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"hello":"world"}


@app.post("/get_text/{text}")
async def get_text(text):

    sentence = Sentence(text)
    tagger = Classifier.load('pos')
    tagger.predict(sentence)
    print(sentence.labels)
    index = 0
    for a in sentence:
        if a.labels[index].value == 'VB':  
            return{"notif":"Edge should not use verbs"}
        elif a.labels[index].value == 'VBD':  
            return{"notif":"Edge should not use verbs"}
        elif a.labels[index].value == 'VBG':  
            return{"notif":"Edge should not use verbs"}
        elif a.labels[index].value == 'VBN':  
            return{"notif":"Edge should not use verbs"}
        elif a.labels[index].value == 'VBP':  
            return{"notif":"Edge should not use verbs"}
        elif a.labels[index].value == 'VBZ':  
            return{"notif":"Edge should not use verbs"}
        # index += 1
      



@app.post("/cek_kata/{text}")
async def cek_kata(text):
    
    sentence = Sentence(text)
    tag_pos = SequenceTagger.load('resources/taggers/example-universal-pos/best-model.pt')
    tag_pos.predict(sentence)
    print(sentence.to_tagged_string())
    index = 0
    for a in sentence:
        if a.labels[index].value == 'VERB':  
            return{"notif":"Edge should not use verbs"}


      