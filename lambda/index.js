/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

let testString = "nothing has happened."
let globalList = [];
let matchesList = [];
//helper functions

function listOfPairs () {
    
    if (globalList.length % 2 === 0){
        // is even Number
        for(let i =0; i<globalList.length; i = i+2){
            
            matchesList.push([globalList[i],globalList[i+1]]);
        }
        return ;
    }
    
    else{
        // for odd, the last element will get a 'by'
        for(let i =0; i<(globalList.length-1); i = i+2){

            matchesList.push([globalList[i],globalList[i+1]]);
        }
        return ;
    }
    
}

function matchesListString () {
    let retString = "";
    for (let i = 0; i<matchesList.length; i++) {
        
        retString = retString + matchesList[i][0] + " will play "+matchesList[i][1] + ". \n";
    }
    return retString;
}

// array shuffle
function shuffle(array) {
  var currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// removes a player from global list
function removeGlobalVal(val) {
  let index = globalList.indexOf(val);
  let newList = []
  let destination = 0;
  for (let i = 0; i<globalList.length; i++){
    if (i !== index) {
      newList[destination] = globalList[i]
      destination++;
    }
    else {
      
    }
  }
  globalList = newList;
}

// removes a match with player val from matchesList
function removePair(val){
  let newList = [];
  let destination = 0;
  for(let i = 0; i<matchesList.length; i++){
    if(!(matchesList[i].includes(val))) {
      newList[destination] = matchesList[i];
      destination++;
    }
    else{
      
    }
  }
  matchesList = newList;
}

// removes a match with a player val from matchesList and returns the opponent of val
function removePairReturnOpponent(val) {
    let opponent = "";
    let newList = [];
    let destination = 0;
    for(let i = 0; i<matchesList.length; i++){
        if(!(matchesList[i].includes(val))) {
          newList[destination] = matchesList[i];
          destination++;
        }
        else{
          let indexOfVal = matchesList[i].indexOf(val);
          if(indexOfVal === 0){
            opponent = matchesList[i][1];
          }
          else{
            opponent = matchesList[i][0];
          }
        }
  }
  matchesList = newList
  return opponent;
}


///////////////////////////////////////////////////////////////////////////////////////////
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        globalList = [];
        matchesList = [];
        const speakOutput = 'Welcome to the Tournament App, an elimination bracket creator. Please state the players';
        
        
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {

        const {requestEnvelope} = handlerInput;
        const namesList = Alexa.getSlotValue(requestEnvelope, 'listOfNames');
        globalList = namesList.split(" ");
        let originalInput = globalList.map((x) => x); // keep a list of original order of names
        globalList = shuffle(globalList); // shuffle list of players
        listOfPairs()  // create the matches list
        let matches = matchesListString();
        return handlerInput.responseBuilder
            .speak("The list of players in this tournament are: " + originalInput +". The matchups are: "+ matches +". Good Luck!")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};



// report a winner
const ReportWinnerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReportWinner';
    },
    handle(handlerInput) {
      
        
        const {requestEnvelope} = handlerInput;
        const winnerName = Alexa.getSlotValue(requestEnvelope, 'winner').toLowerCase();
        
        // updates the game state
        let opponentLost = removePairReturnOpponent(winnerName); // pop loser's match from matchesList
        removeGlobalVal(opponentLost); // pop loser name from global list
        
        
        
        // check if there is a tournament winner
        if(globalList.length === 1){
            return handlerInput.responseBuilder
            .speak("Thank you "+opponentLost+" for playing. Congrats to "+ globalList[0] +" for winning the tournament!")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();    
        }
        
        // check if all matches of this round are over
        if(matchesList.length === 0){
            globalList = shuffle(globalList); // shuffle list of players
            listOfPairs()  // create the next round's matches list
            let matches = matchesListString();
            
            //special finals message
            if (globalList.length === 2){
                return handlerInput.responseBuilder
                .speak(winnerName+" advances to the next round. The semifinals have concluded. Entering the final round, where " + matches)
                    //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                    .getResponse();    
            }
            
            return handlerInput.responseBuilder
                .speak(winnerName+" advances to the next round. This round has concluded. The next round of matches are the following: " + matches)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse();    
                
        }
        
        // matches remain in current round
        return handlerInput.responseBuilder
            .speak(winnerName + " advances to the next round.")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};


// report a loser
const ReportLossIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReportLoss';
    },
    handle(handlerInput) {
    
        
        const {requestEnvelope} = handlerInput;
        const loserName = Alexa.getSlotValue(requestEnvelope, 'loser').toLowerCase();
        
        
        removeGlobalVal(loserName); // pop loser name from global list
        removePair(loserName); // pop loser's match from matchesList
        
        //console.log("After loser " + loserName +" removed, globalList: " + globalList);
        let updatedMatchesList = matchesListString();
        //console.log("the matchesListString is " + updatedMatchesList);
        
        // check if there is a tournament winner
        if(globalList.length === 1){
            return handlerInput.responseBuilder
            .speak("Thank you "+loserName+" for playing. Congrats to "+ globalList[0] +" for winning the tournament!")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();    
        }
        
        // check if all matches of this round are over
        if(matchesList.length === 0){
            globalList = shuffle(globalList); // shuffle list of players
            listOfPairs()  // create the next round's matches list
            let matches = matchesListString();
            
            //special finals message
            if (globalList.length === 2){
                return handlerInput.responseBuilder
                .speak("Thank you "+loserName+" for playing. The semifinals has concluded. Entering the final round, where " + matches + " !")
                    //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                    .getResponse();    
            }
            
            return handlerInput.responseBuilder
                .speak("Thank you "+loserName+" for playing. This round has concluded. The next round of matches are the following: " + matches)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse();    
                
        }
        
        // matches remain in current round
        return handlerInput.responseBuilder
            .speak("Thank you "+loserName+" for playing.")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};


// repeat matchups
const getCurrentMatchesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getCurrentMatches';
    },
    handle(handlerInput) {
        
        let matches  = matchesListString();
        
        return handlerInput.responseBuilder
            .speak("The list of matchups in the current round are: " + matches)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};



const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'To create a players list, say: the players are ... . To report a game outcome, say : I won, or I lost. You can also ask: what are the remaining matches';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        ReportLossIntentHandler,
        ReportWinnerIntentHandler,
        getCurrentMatchesIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();