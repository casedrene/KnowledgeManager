import React from 'react'

var apigClientFactory = require('aws-api-gateway-client').default;
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

class Tts extends React.Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            showTranscribedFiles: [],
            fileLoading: false,
            fileToSpeech: '',
            targetVoice: '',
            fileReady: false,
            taskId: '',
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.downloadTranslation = this.downloadTranslation.bind(this);
    }

    componentDidMount() {
        this.setState({ fileLoading: true })
        s3.listObjects({
            Bucket: s3BucketName,
            Prefix: 'translated-files//',
            MaxKeys: 10
        }, (err, data) => {
            if (err) console.log(err, err.stack);
            else {
                let transfiles = [];
                data.Contents.forEach(transFile => {
                    let transFileName = transFile.Key.slice(18)

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

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true })
        let fileToSpeech = this.state.fileToSpeech;
        let targetVoice = this.state.targetVoice;
        if (fileToSpeech === undefined || targetVoice === undefined) {
            this.setState({
                loading: false
            });
            return alert('Please select both file and voice');
        } else {
            var config = {
                invokeUrl: 'invokeUrl',
                // accessKey: '', 
                // secretKey: '', 
            }
            var apigClient = apigClientFactory.newClient(config);

            var pathParams = {};
            var pathTemplate = '/to-polly'
            var method = 'POST';
            var additionalParams = {};
            var body = {
                fileToSpeech,
                targetVoice
            };

            apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
                .then((result) => {
                    if (result.data.errorMessage){
                        this.setState({loading: false});
                        return alert('An error occured while processing your request. Please try again.');
                    } else {
                        this.setState({
                            taskId: result.data['taskId'],
                            loading: false,
                            fileReady: true
                        });
                    }

                }).catch(function (result) {
                });
        }
    }

    downloadTranslation(event) {
        event.preventDefault();
        let fileName = this.state.fileToSpeech
        fileName = fileName.slice(0, -3)
        let taskId = this.state.taskId;
        let fileKey = fileName + taskId + '.mp3';
        s3.getObject(
            { Bucket: 'Bucket', Key: fileKey },
            (error, data) => {
                if (error != null) {
                    alert("Failed to retrieve an object: " + error);
                } else {
                    var audio = data.Body,
                        blob = new Blob([audio], { type: 'application/octet-stream' }),
                        anchor = document.createElement('a');

                    anchor.download = fileName + 'mp3';
                    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
                    anchor.dataset.downloadurl = ['application/octet-stream', anchor.download, anchor.href].join(':');
                    anchor.click();
                }
            }
        );
    }

    handleInputChange(event) {
        this.setState({
            fileToSpeech: event.target.id
        });
    }

    handleChange(event) {
        this.setState({ targetVoice: event.target.value });
    }

    render() {
        return (
            <section id="tts" className="transcribe">
                <div className="container">
                    <div className="col-12">
                        <div className="col-lg-6 inline-block center">
                            <div className="col-l2 bold">
                                <p>Select a file to convert to speech:</p>
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
                                                        <input id={`${transcribedFile}`} name="s3Files" type="radio" onChange={this.handleInputChange} />
                                                        <div className="transcriptions-list inline-block">{transcribedFile}</div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )};
                                <div>
                                    <form onSubmit={this.handleSubmit}>
                                        <label>
                                            Please select a voice:
                                            <div>
                                                <select value={this.state.targetVoice} onChange={this.handleChange}>
                                                    <option value="Zhiyu"> Zhiyu (Chinese, Mandarin)</option>
                                                    <option value="Mathieu">Mathieu (French)</option>
                                                    <option value="Marlene">Marlene (German)</option>
                                                    <option value="Carla">Carla (Italian)</option>
                                                    <option value="Mizuki">Mizuki (Japanese)</option>
                                                    <option value="Ricardo">Ricardo (Portuguese, Brazilian)</option>
                                                    <option value="Maxim">Maxim (Russian)</option>
                                                    <option value="Enrique">Enrique (Spanish, European)</option>
                                                    <option value="Penelope">Penelope (Spanish, US)</option>
                                                    <option value="Filiz">Filiz (Turkish)</option>
                                                </select>
                                            </div>
                                        </label>
                                    </form>
                                </div>
                                <div className="margin-top-50">
                                    <button onClick={this.handleSubmit} className="btn btn-lg btn-outline">
                                        <span>Convert</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 inline-block center">
                            <div className="col-l2 bold">
                                <p>Download your audio file:</p>
                                <hr className="star-light" />
                            </div>
                            <div className="col-12">
                                <div className="margin-top-50">
                                    {(this.state.loading) ? (<p>Loading...</p>) : (<p></p>)}
                                </div>
                                {(this.state.fileReady) ? (
                                    <div>
                                        Your file is being processed. Please allow about a minute before downloading.
                                    <div className="margin-top-50">
                                            <button onClick={this.downloadTranslation} className="btn btn-lg btn-outline">
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (<p></p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Tts
