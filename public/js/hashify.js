// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser and you may not be able to use File hash feature.');
}
var baseURL = 'https://api.hashify.net';
var maxFileSize = 10000000;
var app = new Vue({
    el: '.container',
    data: {
        userInput: 
            {
                plaintext: '',
                method: '',
                key: '',
                requiredKeyLength:0,
                dataSource: '',
                digestFormat: '',
                filename:'',
            },
        hashMethods: [{"Name":"Blake2b-256","Endpoint":"/hash/BLAKE2B-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2b-384","Endpoint":"/hash/BLAKE2B-384","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2b-512","Endpoint":"/hash/BLAKE2B-512","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2s-128","Endpoint":"/hash/BLAKE2s-128","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2s-256","Endpoint":"/hash/BLAKE2s-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"HighwayHash-256","Endpoint":"/hash/HIGHWAY","MinKeyLength":32,"MaxKeyLength":0},{"Name":"HighwayHash-64","Endpoint":"/hash/HIGHWAY-64","MinKeyLength":32,"MaxKeyLength":0},{"Name":"HighwayHash-128","Endpoint":"/hash/HIGHWAY-128","MinKeyLength":32,"MaxKeyLength":0},{"Name":"MD4","Endpoint":"/hash/MD4","MinKeyLength":0,"MaxKeyLength":0},{"Name":"MD5","Endpoint":"/hash/MD5","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA1","Endpoint":"/hash/SHA1","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA256","Endpoint":"/hash/SHA256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA384","Endpoint":"/hash/SHA384","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA512","Endpoint":"/hash/SHA512","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA512-256","Endpoint":"/hash/SHA512-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA3-256","Endpoint":"/hash/SHA3-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA3-384","Endpoint":"/hash/SHA3-384","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA3-512","Endpoint":"/hash/SHA3-512","MinKeyLength":0,"MaxKeyLength":0}],
        errors:[{
            text: '',
            level: '',
        }],
        results: [],
        isLoading: false,
        //result{Digest:'',Key:'',Type:'',DigestEnc: ''}
    },
    computed:{
        keyLength: function() {
            var len = (new TextEncoder('utf-8').encode(this.userInput.key)).length;
            //console.log("bytes: " + len)
            return  {
                'is-valid': len =>  this.userInput.requiredKeyLength,
                'is-invalid': len < this.userInput.requiredKeyLength
            };
        },
        
    },
    methods:{
        errorClass: function(lvl) {
            return {
                'alert-danger': lvl == 'alert-danger',
                'alert-warning': lvl == 'alert-warning',
            };
        },
        getHashMethods: function() {
            axios.get(baseURL+'/methods')
                .then(response => {
                // JSON responses are automatically parsed.
                this.hashMethods = response.data
                })
                .catch(e => {
                this.errors.push({text:'Unable to connect to API server',level:'danger'})
                });
        },
        submitPlaintext: function() {
            this.userInput.dataSource = '';
            
            // Find Endpoint & Send Request
            axios.post(baseURL+ this.getEndpoint()+'/'+this.userInput.digestFormat, this.userInput.plaintext, { 
            headers: {
                'X-Hashify-Key': this.userInput.key
            }}).then(response => {
            // JSON responses are automatically parsed.
            //this.result = response.data

            this.results.unshift({Digest: response.data.Digest,DigestEnc: response.data.DigestEnc,Key: response.data.Key,Type: response.data.Type,Input: this.userInput.plaintext});
            this.userInput.plaintext = '';
            this.userInput.digestFormat = '';
            this.isLoading = false;
            this.errors = [];
            })
            .catch(e => {
            this.errors.push({text:'Unable to obtain hash digest',level:'danger'});
            this.isLoading = false;
            });

        },
        submitFile: function() {
            this.userInput.dataSource = '';
            var formData = new FormData();
            var formFile = document.querySelector('#file');
            // Handle file too large
            if (formFile.files[0].size > maxFileSize ) {
                this.fileSizeError()
                return
            }
            formData.append("file", formFile.files[0]);
            // Find Endpoint & Send Request
            axios.post(baseURL+ this.getEndpoint()+'/'+this.userInput.digestFormat, formData, {
                headers: {
                'X-Hashify-Key': this.userInput.key,
                'X-Hashify-Process':'multipart/form-data',
                }
            }).then(response => {
                // JSON responses are automatically parsed.
                //this.result = response.data
                this.results.unshift({Digest: response.data.Digest,DigestEnc: response.data.DigestEnc,Key: response.data.Key,Type: response.data.Type,Input: this.userInput.filename});
                this.userInput.plaintext = '';
                this.userInput.filename = '';
                this.userInput.digestFormat = '';
                this.isLoading = false;
                this.errors = [];
                })
                .catch(e => {
                this.errors.push({text:'Unable to obtain hash digest',level:'danger'});
                this.isLoading = false;
                });
                
        },
        requiresKey: function() {
            var val = this.userInput.method;
            var idx = this.hashMethods.findIndex(function(item, i){
                return item.Name === val;
            });
            var reqLength = this.hashMethods[idx].MinKeyLength;
            this.userInput.requiredKeyLength = reqLength;
            return (reqLength > 0);
        },
        getEndpoint: function() {
            var val = this.userInput.method;
            var idx = this.hashMethods.findIndex(function(item, i){
                return item.Name === val;
            });
            this.userInput.method = '';
            this.isLoading = true;
            return this.hashMethods[idx].Endpoint;
        },
        checkRandom: function() {
            if (! this.randomKey.generate) {
                this.userInput.key = 'random';
            } else {
                this.userInput.key = '';
            }
        },
        generateKey: function() {
            axios.get(baseURL+'/keygen/'+this.userInput.requiredKeyLength)
                .then(response => {
                    // JSON responses are automatically parsed.
                    this.userInput.key = response.data.KeyHex
                })
                .catch(e => {
                    this.errors.push({text:'Unable to connect to API server',level:'alert-danger'});
                });
        },
        addFile: function(e) {
            if (e.target.files[0].size > maxFileSize ) {
                this.fileSizeError()
                return
            }
            this.userInput.filename = e.target.files[0].name;
            
        },
        fileSizeError: function(e) {
            this.errors.push({text:'Web App file size limit is 10MB, use large file via API.',level:'alert-warning'});
            document.getElementById("file").value = "";
            return
        },
      },
    mounted: function() {
        //this.getHashMethods();
    },
});