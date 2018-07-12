var app = new Vue({
    el: '.container',
    data: {
        userInput: 
            {
                plaintext: '',
                method: ''
            },
        hashMethods: [],
        dataSource: {
            name: ''
        },
        errors:[{
            text: '',
            level: '',
        }],
        results: [],
        //result{Digest:'',Key:'',Type:'',}
    },
    methods:{
        getHashMethods: function() {
            axios.get('http://localhost:1313/methods')
                .then(response => {
                // JSON responses are automatically parsed.
                this.hashMethods = response.data
                })
                .catch(e => {
                this.errors.push({text:'Unable to connect to API server',level:'danger'})
                })
        },
        submitPlaintext: function() {
            axios.post('http://localhost:1313/hash/'+this.userInput.method)
                .then(response => {
                // JSON responses are automatically parsed.
                //this.result = response.data
                this.results.unshift({Digest: response.data.Digest,Key: response.data.Key,Type: response.data.Type,Input: this.userInput.plaintext});
                this.userInput.plaintext = '';
                this.userInput.method = '';
                })
                .catch(e => {
                this.errors.push({text:'Unable to obtain hash digest',level:'danger'})
                })
                
        }
      },
    mounted: function() {
        this.getHashMethods();
    },
})