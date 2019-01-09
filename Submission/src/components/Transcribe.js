import React from 'react'
import ReactDropzone from 'react-dropzone'
var AWS = require('aws-sdk');

var s3BucketName = 's3BucketName';

AWS.config.region = 'region'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'IdentityPoolId',
});

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: s3BucketName }
});

class Transcribe extends React.Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            showTranscribedFiles: [],
            transcriptToDownload: '',
            fileUploaded: false,
            fileLoading: false,
        }
        this.onDrop = this.onDrop.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        this.setState({ fileLoading: true })
        s3.listObjects({
            Bucket: "s3BucketName",
            Prefix: 'transcribed-files//',
            MaxKeys: 10
        }, (err, data) => {
            if (err) console.log(err, err.stack);
            else {
                let transfiles = [];
                data.Contents.forEach(transFile => {
                    let transFileName = transFile.Key.slice(19)

                    transfiles.push(
                        transFileName
                    )
                });
                this.setState({
                    showTranscribedFiles: transfiles,
                    fileLoading: false
                });
            }
        });
    }

    onDrop = (files) => {
        this.setState({ loading: true })
        var file = files[0];
        var fileName = file.name;
        let fileExtension = fileName.split('.').pop();
        var extensionArray = ["mp3", "mp4", "wav"];
        if (extensionArray.indexOf(fileExtension) > -1) {
            var bucketFolder = 'uploaded-files' + '//';
            var fileKey = bucketFolder + fileName;
            s3.upload({
                Key: fileKey,
                Body: file,
                ACL: 'public-read'
            }, (err, data) => {
                if (err) {
                    this.setState({ loading: false });
                    return alert('There was an error uploading your file: ', err.message);
                }
                this.setState({ loading: false, fileUploaded: true });
            });
        } else {
            return alert('Incorrect file format. Please upload specifies audio files only.');
        }

    }

    handleSubmit(event) {
        event.preventDefault();
        let fileKey = 'transcribed-files//' + this.state.transcriptToDownload;
        console.log(this.state.transcriptToDownload)
        s3.getObject(
            { Bucket: s3BucketName, Key: fileKey },
            (error, data) => {
                if (error != null) {
                    alert("Failed to retrieve an object: " + error);
                } else {
                    var text = data.Body.toString(),
                        blob = new Blob([text], { type: 'text/plain' }),
                        anchor = document.createElement('a');

                    anchor.download = this.state.transcriptToDownload;
                    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
                    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
                    anchor.click();
                }
            }
        );
    }

    handleInputChange(event) {
        this.setState({
            transcriptToDownload: event.target.id
        });
    }


    render() {
        return (
            <section id="transcribe" className="transcribe">
                <div className="container">
                    <div className="col-12">
                        <div className="col-lg-6 inline-block center">
                            <div className="col-12 bold">
                                <p>Upload audio files for transcription:</p>
                                <hr className="star-light" /> 
                                <p>This is a demo application. 
                                    Please make sure the files you upload are not more than 1 minute in length and the name of the file contains no spaces.</p>
                                <div className="app inline-block">
                                    <ReactDropzone onDrop={this.onDrop}>
                                        Drop your audio file in .wav, .mp3 or .mp4 with a unique name here or click to open File Explorer!
                                    </ReactDropzone>
                                </div>
                                <div className="margin-top-50">
                                    {(this.state.loading) ? (<p>Loading...</p>) : (<p></p>)}
                                </div>
                                {(this.state.fileUploaded) ? (
                                    <div className="margin-top-50">
                                        <h3>Upload successful!</h3>
                                        <p>It may take a while to transcribe a file.</p>
                                        <p>Please refresh the page to view your new trancripton. </p>
                                    </div>
                                ) : (<p></p>)}
                            </div>
                        </div>
                        <div className="col-lg-6 padding-left-40 inline-block center">
                            <div className="col-l2 bold">
                                <p>Download the transcription:</p>
                                <hr className="star-light" /> 
                            </div>
                            <div className="col-12">
                                {(this.state.fileLoading) ? (
                                    <div>
                                        <p>Loading files...</p>
                                    </div>
                                ) : (
                                    <div>
                                        {this.state.showTranscribedFiles.map((transcribedFile, index) => (
                                            <div key={index}>
                                                <label>
                                                    <input  id={`${transcribedFile}`} name="s3Files" type="radio" onChange={this.handleInputChange}/>
                                                    <span className="transcriptions-list inline-block">{transcribedFile}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )};
                                <div className="margin-top-50">
                                    <button onClick={this.handleSubmit} className="btn btn-lg btn-outline">
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Transcribe
