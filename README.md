# Knowledge Manager
This repo contains files for the AWS AI hackathon submission.

Demo: https://www.youtube.com/watch?v=VmRo68nQ-PU

The purpose of the application is to help students and international students manage their study materials. 

The functionality includes:

1. Transcription
Many universities provide audio/video recordings of the lectures, or the students can record the lectures themselves. These recordings then can be uploaded and transcribed which may help students with reviewing the study materials. Also, text files can be easily searched which would enable students to find relevant materials in a short period of time, which would be difficult if the student had to go through hours of audio lectures.

2. Translation
International students studying in English speaking countries often struggle with overcoming the language barrier. This application would allow them not just transcribe the lectures for easier review, but also translate the text to their native language (applies to languages supported by Amazon Translate). Academic workers from non-English speaking background could also use this application when attending international conferences. The talks presented at the conferences are often available to attendees. Academic workers could transcribe and translate the talks to their native language to help them better understand the information provided and incorporate new insights into their work. 

3. Text-to-Speech
Once the text is translated, the users also have an option to convert their text into an audio file with Amazon Polly to accomodate for various learning styles and possible disabilities.

4. Text detection
Students attending lectures or attendees at conferences often take photos of the speakers' slides. Those may be hard to manage and search. Text detection functionality could help users transcribe the text on the presentation slides and save their time - avoiding manual transcription.

Python files contain code implemented using lambda functions.

# Inspiration
When I was studying in Australia as an international student, I saw many of my friends struggle with their assignments and exams. Many international students face serious learning difficulties in the classroom and even though they are working very hard, the language barrier sometimes holds them back. I decided to use my personal experience as an inspiration to build this application.

# What it does
The purpose of my application is to help both English-speaking and international students especially in the first one or two years of studying. The students can upload audio or video files of their lectures. By transcribing the lectures, they will be able to focus on the topic of the discussion rather than note-taking. Translating the transcription and converting it to text may also help students understand the concepts better until they improve their English skills to a desired level and it accommodates various learning styles. They can also extract the text from the photos of lecture slides to make their learning even more efficient.

The application may also be useful for people from non-English speaking countries who often attend international conferences. The recordings of the talks are often available online. Users can easily convert them to one of many supported languages and then incorporate their new knowledge into their work.

# How I built it
I started with setting up IAM roles and Cognito authentication. After that, I moved onto uploading audio files to an S3 bucket. Then, I set up the trigger in S3 and created a Lambda function to send the files to Amazon Transcribe, format the response, save it in S3, show the user a list of files and give them an option to download them to their local file system.

Now I already had the transcribed files saved, so I listed the contents of an S3 bucket to the user. I set up API Gateway to send the file reference and target language data to another Lambda function. Lambda sent the files to Amazon Transcribe, processed the response and saved the text file to S3. User is again able to download the file.

Once I had translated files, I could repeat previous steps - show the user a list of files and let them select one to convert to speech, select voice Id, set up another API Gateway endpoint, send the data to Lambda and then to Amazon Polly. StartSpeechSynthesisTask can convert long texts to speech which is ideal for lectures, and the files are saved directly to S3. The user than has the ability to download these mp3 files.

The last bit was similar to the first one. I started with uploading images to an S3 bucket. The upload triggers a Lambda function which sends the image to Amazon Rekognition in order to detect text. The response is processed in the Lambda function and the user receives the extracted text.

# Challenges I ran into
I found it a bit difficult to find the documentation for Amazon Polly and also Elastic Search with examples in python.

# Accomplishments that I'm proud of
I've build the application myself in about three weeks which makes me really proud as this is my first AWS project.

# What I learned
I've learnt how to create S3 buckets, configure API Gateway and Cognito, trigger Lambda functions, create user roles and use AWS AI services. I've also learnt how to build a multi-page application in React.js.


