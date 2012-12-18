control = {
    
    //  This is our filters object, this is where we are going to keep
    //  a tally of the number of times each filter is used.
    //
    //  NOTE, we are pre-populating this due to a bug in the Flickr App
    //  uploader that has localised both the filter name in the UI and
    //  in the machine tag that gets recorded on Flickr. This means there's
    //  several versions of the "chameleon" filter under different names
    //  like "caméléon", "camaleão", "camaleón", "camaleonte" and so
    //  on.
    //
    //  While we could roll those up, as the bug will hopefully get
    //  fixed and the filters are still primarily the English version
    //  we are going to white list the English version found in the
    //  US Enlish version of the APP and count all the others as
    //  "other"
    filters: {
        panda: 0,
        mammoth: 0,
        ocelot: 0,
        chameleon: 0,
        wallaby: 0,
        iguana: 0,
        aardvark: 0,
        narwhal: 0,
        salamander: 0,
        flamingo: 0,
        toucan: 0,
        orca: 0,
        peacock: 0,
        chinchilla: 0,
        orangutan: 0
    },
    scores: [],

    filter: 0,
    nofilter: 0,
    other: 0,

    others: {},

    //  Setup all the setup things, in this case not much at all
    init: function() {
        this.fetchMachineTags();
    },

    //  This is where we make the call to the appspot server
    //  to go grab the machine tags. The reason for having it
    //  up on appspot is because the API call needs to be
    //  signed, which means putting your API key in code.
    //
    //  Here the appspot endpoint is acting as our proxy to the
    //  flickr.machinetags.getValues...
    //
    //  http://api.flickr.com/services/rest/?method=flickr.machinetags.getValues&namespace=flickriosapp&predicate=filter
    //
    //  ...which gets us all the values used in the flickriosapp:filter=* namespace thingy
    //
    //  We could call each filter type in turn which doesn't involve having to use a signed
    //  API call, but then we have to make several calls instead of just this one that gets
    //  us both the filter names and the counts.
    fetchMachineTags: function() {

        // Here's the call
        $.getJSON("http://cat800-flickr-filtrtron.appspot.com/?callback=?")

        //  If it's successful (in theory), then we go thru all that here
        .success(
            function(data) {

                //  check that everything's ok in a rather over the top fashion
                if ('stat' in data && data.stat == 'ok' && 'values' in data && 'value' in data.values && data.values.value.length > 0) {

                    //  Now we can loop through the values tucking the ones we
                    //  want into the filters dict
                    var filter = null;
                    var score = null;
                    
                    for (var i in data.values.value) {

                        filter = data.values.value[i]._content;
                        score = parseInt(data.values.value[i].usage, 10);

                        //  Check to see if we have the name
                        //  of this filter in the filters object
                        //  if so then add it, otherwise
                        //  either add the tally to "other"
                        //  of "nofilter"
                        if (filter in control.filters) {
                            control.filters[filter] = score;

                            //  Also store the score as we're going to us this to sort with
                            //  later
                            control.scores.push(score);
                            control.filter += score;
                        } else {

                            //  Put it into no filter, or increment the "other" value
                            if (filter == 'nofilter') {
                                control.nofilter = score;
                            } else {
                                control.other += score;
                                // And put the other into the others object
                                if (!(filter in control.others)) {
                                    control.others[filter] = score;
                                }
                            }
                        }
                    }

                    control.displayResults();

                } else {
                    //  TODO, handle it when it hasn't worked very well here
                    //  this is unlikely
                    utils.log('DATA IS BAD');
                }

            }
        )

        //  otherwise if there was an error let's handle that here, but we'll
        //  not worry about that *too* much because hey, Google AppEngine and
        //  the Flickr API never go down, right!
        .error(
            function() {
                //  TODO, handle error condition here
                utils.log('Something went wrong');
            }
        );
    },

    displayResults: function() {


        //  To start with let's just loop through all the filters
        //  adding them to the table
        var percent = null;

        //  When
        var maxScore = control.scores.sort(function(a,b){return b-a;})[0];

        for (var filter in this.filters) {

            percent = parseInt(this.filters[filter] / this.filter * 1000, 10) /     10;

            $('.filterResults').append(
                $('<tr>')
                    .append($('<td>').addClass('filter').html(filter))
                    .append($('<td>').addClass('score')
                        .append($('<div>').addClass('background').html('&nbsp;' + this.filters[filter] + ' (' + percent + '%)'))
                        .append($('<div>').addClass('foreground')
                            .css('width', this.filters[filter] / maxScore * 100 + '%')
                            .html('&nbsp;' + this.filters[filter] + ' (' + percent + '%)'))
                    )
            );
        }

        //  Let's throw the others in there
        $('.filterResults').append(
            $('<tr>')
                .append($('<td>').addClass('filter').html('others')
                    .append($('<sup>')
                        .append($('<a>').attr('href', '#others').text('*'))
                    )
                )
            .append($('<td>').addClass('score').html(this.other))
        );

        //  Now put the total for all filters and no filters
        $('.hasFilter .score').html(parseInt((this.filter + this.other) / (this.filter + this.other + this.nofilter) * 1000, 10) / 10 + '% <small>(' + (this.filter + this.other) + ')</small><br />');
        $('.noFilter .score').html( 100 - (parseInt((this.filter + this.other) / (this.filter + this.other + this.nofilter) * 1000, 10) / 10) + '% <small>(' + this.nofilter + ')<small>');

        $('.total .score').html(this.filter + this.other + this.nofilter);
        
        //  And put all the "other" filters into the others table
        for (filter in this.others) {

            percent = parseInt(this.filters[filter] / this.filter * 1000, 10) /     10;

            $('.otherResults').append(
                $('<tr>')
                    .append($('<td>').addClass('filter').html(filter))
                    .append($('<td>').addClass('score').html(this.others[filter]))
            );
        }

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