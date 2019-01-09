import json
import boto3
import time

translate = boto3.client(service_name='translate', region_name='region_name', use_ssl=True)

def lambda_handler(event, context):
    #get file to translate
    s3 = boto3.resource('s3')
    fileKey = 'transcribed-files//' + event['file']
    obj = s3.Object('BUCKET_NAME', fileKey)
    text_to_translate = obj.get()['Body'].read().decode('utf-8') 
    
    # translate text
    result = translate.translate_text(Text=text_to_translate, 
            SourceLanguageCode='en', TargetLanguageCode=event['targetLanguage'])
            
    path_to_upload = 'translated-files//' + event['file']
    obj_to_upload = s3.Object('BUCKET_NAME', path_to_upload)
    obj_to_upload.put(Body=result.get('TranslatedText'))
    
    return {
        "statusCode": 200,
    }
