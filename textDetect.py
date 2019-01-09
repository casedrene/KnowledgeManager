import boto3

def lambda_handler(event, context):
    
    bucket='textdetect'
    photo=event['imageName']

    client=boto3.client('rekognition')

    response=client.detect_text(Image={'S3Object':{'Bucket':bucket,'Name':photo}})

    textDetections=response['TextDetections']

    collectedText = ''
    for text in textDetections:
        if text['Type'] == 'LINE':
            collectedText += text['DetectedText'] + '\n'

    return {
        'statusCode': 200,
        'body': collectedText
    }

