import React from 'react'
import ReactDropzone from 'react-dropzone'
var AWS = require('aws-sdk');
var apigClientFactory = require('aws-api-gateway-client').default;

var s3BucketName = 's3BucketName';

AWS.config.region = 'region'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'IdentityPoolId',
});

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: s3BucketName }
});

class TextDetection extends React.Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            fileUploaded: false,
            fileLoading: false,
            imageName: '',
            fileReady: false,
            imageText: '',
        }
        this.onDrop = this.onDrop.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    onDrop = (files) => {
        this.setState({ loading: true })
        var file = files[0];
        var fileName = file.name;
        var fileKey = fileName;
        s3.upload({
            Key: fileKey,
            Body: file,
            ACL: 'public-read'
        }, (err, data) => {
            if (err) {
                return alert('There was an error uploading your file: ', err.message);
            }
            this.setState({ loading: false, fileUploaded: true, imageName: fileKey });
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true })
        let imageName = this.state.imageName;
            var config = {
                invokeUrl: 'invokeUrl',
                // accessKey: '', 
                // secretKey: '', 
            }
            var apigClient = apigClientFactory.newClient(config);

            var pathParams = {};
            var pathTemplate = '/to-rekognition'
            var method = 'POST';
            var additionalParams = {};
            var body = {
                imageName
            };

            apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
                .then((result) => {
                    if (result.data.errorMessage){
                        this.setState({loading: false});
                        return alert('An error occured while processing your request. Please try again.');
                    } else {
                        this.setState({
                            loading: false,
                            fileReady: true,
                            imageText: result.data.body
                        });
                    }
                }).catch(function (result) {
                });
    }

    render() {
        return (
            <section id="textdetection" className="transcribe">
                <div className="container">
                    <div className="col-12">
                        <div className="col-lg-6 inline-block center">
                            <div className="col-12 bold">
                                <p>Upload your image with text here:</p>
                                <hr className="star-light" /> 
                                <div className="app inline-block">
                                    <ReactDropzone onDrop={this.onDrop}>
                                        Drop your image file here or click to open File Explorer!
                                    </ReactDropzone>
                                </div>
                                <div className="margin-top-50">
                                    {(this.state.loading) ? (<p>Loading...</p>) : (<p></p>)}
                                </div>
                                {(this.state.fileUploaded) ? (
                                    <div className="margin-top-50">
                                        <h3>Upload successful!</h3>
                                        <p>Click on the button on the right to detect text.</p>
                                    </div>
                                ) : (<p></p>)}
                            </div>
                        </div>
                        <div className="col-lg-6 padding-left-40 inline-block center">
                            <div className="col-l2 bold">
                                <p>Detect text:</p>
                                <hr className="star-light" /> 
                            </div>
                            {(this.state.fileUploaded) ? (
                                <div className="margin-top-50">
                                        <button onClick={this.handleSubmit} className="btn btn-lg btn-outline">
                                            <span>Go!</span>
                                        </button>
                                    </div>
                             ) : (<p></p>)}
                            <div className="col-12 margin-top-50">
                                {(this.state.fileReady) ? (
                                    <div>
                                        <p>{this.state.imageText}</p>
                                    </div>
                                ) : (<p></p>)};
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default TextDetection
