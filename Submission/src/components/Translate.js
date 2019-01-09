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

class Translate extends React.Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            showTranscribedFiles: [],
            fileLoading: false,
            transcriptToTranslate: '',
            targetLanguage: 'ar',
            fileReady: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.downloadTranslation = this.downloadTranslation.bind(this);
    }

    componentDidMount() {
        this.setState({ fileLoading: true })
        s3.listObjects({
            Bucket: "Bucket",
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

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true })
        let fileToTranslate = this.state.transcriptToTranslate;
        let targetLanguage = this.state.targetLanguage;
        if (fileToTranslate === undefined || targetLanguage === undefined) {
            this.setState({
                loading: false
            });
            return alert('Please select both file and target language');
        } else {
            var config = {
                invokeUrl: 'invokeUrl',
                // accessKey: '', 
                // secretKey: '', 
            }
            var apigClient = apigClientFactory.newClient(config);

            var pathParams = {};
            var pathTemplate = '/to-translate'
            var method = 'POST';
            var additionalParams = {};
            var body = {
                file: fileToTranslate,
                targetLanguage: targetLanguage

            };

            apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
                .then((result) => {
                    if (result.data.errorMessage){
                        this.setState({loading: false});
                        return alert('An error occured while processing your request. Please try again.');
                    } else {
                        this.setState({
                            loading: false,
                            fileReady: true
                        });
                    }
                }).catch(function (result) {
                });
        }
    }

    handleInputChange(event) {
        this.setState({
            transcriptToTranslate: event.target.id
        });
    }

    handleChange(event) {
        this.setState({ targetLanguage: event.target.value });
    }

    downloadTranslation(event) {
        event.preventDefault();
        let fileKey = 'translated-files//' + this.state.transcriptToTranslate;
        s3.getObject(
            { Bucket: s3BucketName, Key: fileKey },
            (error, data) => {
                if (error != null) {
                    alert("Failed to retrieve an object: " + error);
                } else {
                    console.log(data)
                    var text = data.Body.toString(),
                        blob = new Blob([text], { type: 'text/plain' }),
                        anchor = document.createElement('a');

                    anchor.download = this.state.targetLanguage + '_' + this.state.transcriptToTranslate;
                    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
                    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
                    anchor.click();
                }
            }
        );
    }

    render() {
        return (
            <section id="translate" className="translate">
                <div className="container">
                    <div className="col-12">
                        <div className="col-lg-6 inline-block center">
                            <div className="col-l2 bold">
                                <p>Select a file to translate:</p>
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
                                    <label>Default language: English</label>
                                </div>
                                <div>
                                    <form onSubmit={this.handleSubmit}>
                                        <label>
                                            Please select target language:
                                            <div>
                                                <select value={this.state.targetLanguage} onChange={this.handleChange}>
                                                    <option value="ar">Arabic</option>
                                                    <option value="zh">Chinese (Simplified)</option>
                                                    <option value="zh-TW">Chinese (Traditional)</option>
                                                    <option value="cs">Czech</option>
                                                    <option value="fr">French</option>
                                                    <option value="de">German</option>
                                                    <option value="it">Italian</option>
                                                    <option value="ja">Japanese</option>
                                                    <option value="pt">Portuguese</option>
                                                    <option value="ru">Russian</option>
                                                    <option value="es">Spanish</option>
                                                    <option value="tr">Turkish</option>
                                                </select>
                                            </div>
                                        </label>
                                    </form>
                                </div>
                                <div className="margin-top-50">
                                    <button onClick={this.handleSubmit} className="btn btn-lg btn-outline">
                                        <span>Translate</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 inline-block center">
                            <div className="col-l2 bold">
                                <p>Translated file:</p>
                                <hr className="star-light" />
                            </div>
                            <div className="col-12">
                                <div className="margin-top-50">
                                    {(this.state.loading) ? (<p>Loading...</p>) : (<p></p>)}
                                </div>
                                {(this.state.fileReady) ? (
                                    <div>
                                        File is ready for download!
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

export default Translate
