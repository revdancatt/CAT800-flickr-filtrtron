control = {
    
    //  Setup all the setup things, in this case not much at all
    init: function() {
        this.fetchMachineTags();
    },

    //  This is where we make the call to the appspot server
    //  to go grab the machine tags
    fetchMachineTags: function() {

        $.getJSON("http://cat800-flickr-filtrtron.appspot.com/?callback=?",

            function(data) {

                control.tmp = data;

                if ('stat' in data && data.stat == 'ok' && 'values' in data && 'value' in data.values && data.values.value.length > 0) {
                    utils.log('DATA IS GOOD');
                }

            }
        );        
    }

};

utils = {
    
    log: function(msg) {

        try {
            console.log(msg);
        } catch(er) {
            //  nowt
        }
    }
};