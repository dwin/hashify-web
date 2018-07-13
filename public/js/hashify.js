var app = new Vue({
    el: '.container',
    data: {
        userInput: 
            {
                plaintext: '',
                method: '',
                key: '',
                requiredKeyLength:0,
                endpoint:'',
                dataSource: '',
                digestFormat: '',
            },
        hashMethods: [{"Name":"Blake2b-256","Endpoint":"/hash/BLAKE2B-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2b-384","Endpoint":"/hash/BLAKE2B-384","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2b-512","Endpoint":"/hash/BLAKE2B-512","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2s-128","Endpoint":"/hash/BLAKE2s-128","MinKeyLength":0,"MaxKeyLength":0},{"Name":"Blake2s-256","Endpoint":"/hash/BLAKE2s-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"HighwayHash-256","Endpoint":"/hash/HIGHWAY","MinKeyLength":32,"MaxKeyLength":0},{"Name":"HighwayHash-64","Endpoint":"/hash/HIGHWAY-64","MinKeyLength":32,"MaxKeyLength":0},{"Name":"HighwayHash-128","Endpoint":"/hash/HIGHWAY-128","MinKeyLength":32,"MaxKeyLength":0},{"Name":"MD4","Endpoint":"/hash/MD4","MinKeyLength":0,"MaxKeyLength":0},{"Name":"MD5","Endpoint":"/hash/MD5","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA1","Endpoint":"/hash/SHA1","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA256","Endpoint":"/hash/SHA256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA384","Endpoint":"/hash/SHA384","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA512","Endpoint":"/hash/SHA512","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA512-256","Endpoint":"/hash/SHA512-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA3-256","Endpoint":"/hash/SHA3-256","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA3-384","Endpoint":"/hash/SHA3-384","MinKeyLength":0,"MaxKeyLength":0},{"Name":"SHA3-512","Endpoint":"/hash/SHA3-512","MinKeyLength":0,"MaxKeyLength":0}],
        errors:[{
            text: '',
            level: '',
        }],
        results: [],
        //result{Digest:'',Key:'',Type:'',DigestEnc: ''}
    },
    computed:{
        keyLength: function() {
            var len = (new TextEncoder('utf-8').encode(this.userInput.key)).length
            console.log("bytes: " + len)
            return  {
                'is-valid': len =>  this.userInput.requiredKeyLength,
                'is-invalid': len < this.userInput.requiredKeyLength
            };
        }
    },
    methods:{
        getHashMethods: function() {
            axios.get('https://api.hashify.net/methods')
                .then(response => {
                // JSON responses are automatically parsed.
                this.hashMethods = response.data
                })
                .catch(e => {
                this.errors.push({text:'Unable to connect to API server',level:'danger'})
                })
        },
        submitPlaintext: function() {
            // Find Endpoint & Send Request
            axios.post('https://api.hashify.net'+ this.getEndpoint()+'/'+this.userInput.digestFormat, this.userInput.plaintext, { 
                headers: {
                    'X-Hashify-Key': this.userInput.key
                }}).then(response => {
                // JSON responses are automatically parsed.
                //this.result = response.data
                this.results.unshift({Digest: response.data.Digest,DigestEnc: response.data.DigestEnc,Key: response.data.Key,Type: response.data.Type,Input: this.userInput.plaintext});
                this.userInput.plaintext = '';
                this.userInput.method = '';
                this.userInput.dataSource = '';
                this.userInput.digestFormat = '';
                this.errors = [];
                })
                .catch(e => {
                this.errors.push({text:'Unable to obtain hash digest',level:'danger'})
                })
                
        },
        requiresKey: function() {
            var val = this.userInput.method
            var idx = this.hashMethods.findIndex(function(item, i){
                return item.Name === val
            });
            var reqLength = this.hashMethods[idx].MinKeyLength;
            this.userInput.requiredKeyLength = reqLength;
            return (reqLength > 0)
        },
        getEndpoint: function() {
            var val = this.userInput.method
            var idx = this.hashMethods.findIndex(function(item, i){
                return item.Name === val
            });
            return this.hashMethods[idx].Endpoint
        },
        checkRandom: function() {
            if (! this.randomKey.generate) {
                this.userInput.key = 'random'
            } else {
                this.userInput.key = ''
            }
        },
        generateKey: function() {
            axios.get('https://api.hashify.net/keygen/'+this.userInput.requiredKeyLength)
                .then(response => {
                // JSON responses are automatically parsed.
                this.userInput.key = response.data.KeyHex
                })
                .catch(e => {
                this.errors.push({text:'Unable to connect to API server',level:'danger'})
                })
        },
      },
    mounted: function() {
        //this.getHashMethods();
    },
})