from __future__ import print_function
import json
import time
import boto3
import uuid

BUCKET_NAME = 'BUCKET_NAME' 
KEY = ''

def lambda_handler(event, context):
    transcribe = boto3.client('transcribe')
    job_name = str(uuid.uuid4())
    file_name = str(event['Records'][0]['s3']['object']['key'])
    job_uri = "s3://knowledgemanager/" + file_name
    
    # start transcription job
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': job_uri},
        MediaFormat=file_name[-3:], #check file extension
        LanguageCode='en-US',
        OutputBucketName= 'BUCKET_NAME'
    )
    while True:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            break
        time.sleep(5)
    KEY_STRING = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
    KEY = KEY_STRING.replace('https://s3.us-west-2.amazonaws.com/BUCKET_NAME/', '')
    
    #get result of transcription
    s3 = boto3.resource('s3')
    obj = s3.Object(BUCKET_NAME, KEY)
    text_to_transform = obj.get()['Body'].read().decode('utf-8') 
    text_json = json.loads(text_to_transform)
    transcription_text = text_json['results']['transcripts'][0]['transcript']
   
    #upload transformed file to return 
    path_to_upload = 'transcribed-files' + file_name.replace("uploaded-files/","/")[:-4] + '.txt'
    print(path_to_upload, file_name)
    obj_to_upload = s3.Object('knowledgemanager', path_to_upload)
    obj_to_upload.put(Body=transcription_text)

    return {
        "statusCode": 200
    }

   

