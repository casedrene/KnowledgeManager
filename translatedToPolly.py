import json
import boto3
import time

def lambda_handler(event, context):

    #get file to convert to speech
    s3 = boto3.resource('s3')
    fileKey = 'translated-files//' + event['fileToSpeech']
    obj = s3.Object('BUCKET_NAME', fileKey)
    text_to_convert = obj.get()['Body'].read().decode('utf-8') 
    
    polly_client = boto3.Session(region_name='us-west-2').client('polly')
    
    file_name = event['fileToSpeech']
    
    response = polly_client.start_speech_synthesis_task(VoiceId=event['targetVoice'],
    OutputS3BucketName='OUTPUT_BUCKET_NAME',
    OutputS3KeyPrefix=file_name[:-4],
    OutputFormat='mp3',
    Text = text_to_convert)
  
    taskId = response['SynthesisTask']['TaskId']
    print ("Task id is {} ".format(taskId))
    task_status = polly_client.get_speech_synthesis_task(TaskId = taskId)
    
    
    return {
        'statusCode': 200,
        'taskId': taskId
    }
