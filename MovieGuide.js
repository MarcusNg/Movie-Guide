var https = require('https')

exports.handler = (event,context) => {

try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to Movie Guide, please ask for a movie title", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
          case "GetMovieInfo":
            console.log(event.request.intent.slots.MovieTitle.value)
	    // Replace movieTitle whitespace with +
	    var movieTitle = event.request.intent.slots.MovieTitle.value
	    movieTitle = movieTitle.replace(/\s/g, "+")
            var endpoint = "https://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&r=json" // ENDPOINT GOES HERE
	    console.log("${endpoint}")
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                  var data = JSON.parse(body)
		  if data["Response"] != false { 
		  // Movie info
                  var title = data["Title"]
	       	  var released = data["Released"]
		  var runtime = data["Runtime"]
		  var director = data["Director"]
		  var rating = data["imdbRating"]
		  var cast = data["Actors"]
		  var plot = data["Plot"]
                  context.succeed(
                      generateResponse(
			  buildSpeechletResponse(`${title} was directed by ${director} and was released on ${released}. 
The runtime is ${runtime} and has a rating of ${rating} on IMDB. The cast includes ${cast}. The plot is: ${plot}`, true),
			  {}
                      )
                  )
              })
            })
            break;
	    
          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
    
}
