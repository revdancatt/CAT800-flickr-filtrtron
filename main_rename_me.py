#!/usr/bin/env python
import webapp2
from google.appengine.api import urlfetch

############################################################################
############################################################################
#
#   You need to rename this to main.py and add your Flickr API key in here
#
############################################################################
############################################################################


class MainHandler(webapp2.RequestHandler):
    def get(self):

        #   Put your API key in here
        apiKey = '[YOUR FLICKR API KEY HERE]'

        #   This is the API call used to find all the filters user with the
        #   flickriosapp:filter=* machine tag
        url = "http://api.flickr.com/services/rest/?method=flickr.machinetags.getValues&api_key=%s&namespace=flickriosapp&predicate=filter&format=rest&format=json&nojsoncallback=1" % apiKey

        #   Go make the call
        result = urlfetch.fetch(url=url)

        #
        #   Add your error checking code here ;)
        #

        #   Get ready to return some JSON
        self.response.headers['Content-Type'] = 'application/json'

        #   If we've been asked for callback throw that on, otherwise
        #   just send back the raw json
        if 'callback' in self.request.arguments():
            data = '%s(%s)' % (self.request.get('callback'), result.content)
            self.response.out.write(data)
        else:
            self.response.out.write(result.content)


app = webapp2.WSGIApplication([
    ('/', MainHandler)
], debug=True)
