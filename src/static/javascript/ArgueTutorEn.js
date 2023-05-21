import Swal from "sweetalert";


let IDKcounter = 0;

let evaluationRunning = false;

const CHATBOT_URL = "http://127.0.0.1:8080";
export {CHATBOT_URL}


/**
 * start up function
 *
 * @param fn
 *          is called when the document is ready
 */
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
export {ready}

/**
 * Initializes chatbot, gets first response, and loads intro message
 *
 * @param updateChatBoxContent
 *          function that updates the chat box with the argument passed to it
 */
function initializeBot(updateChatBoxContent, gpt, UUID) {
    console.log(gpt)
    if (gpt) {
        getResponse("StartGPT", gpt, updateChatBoxContent, UUID);
    } else {
        getResponse("Introduction", gpt, updateChatBoxContent, UUID);
    }
}
export {initializeBot}

/**
 * Get current time
 *
 * @returns {string} current time
 */
function getTime() {
    let date = new Date(Date.now());
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return hours + ":" + ((minutes < 10) ? "0" : "") + minutes;
}

export {getTime}


/**
 * adds chatbot message to the chatbox
 *
 * @param text
 *          bot message
 * @param updateChatBoxContent
 *          function to update the chatbox content
 */
function addBotMessage(text, updateChatBoxContent) {
    if (text === null) return;

    let botHtml =
        '<div class="message">' +
            '<div class="message-botname">MindMate</div>' +
            '<div class="botText">' +
                '<div class="avatar-wrapper">' +
                    '<img class="avatar" src="/img/ArgueTutor.png">' +
                '</div>' +
                '<div class="data-wrapper">' + text +'</div>' +
            '</div>' +
        '<div class="message-time">' + getTime() + '</div></div>';

    updateChatBoxContent(botHtml);

    document.getElementById("buttonInput").disabled = false;
    document.getElementById("textInput").disabled = false;
    document.getElementById("textInput").focus();
}

/**
 * Adds user message to the chatbox
 *
 * @param text
 *          user message
 * @param updateChatBoxContent
 *          function to update the chatbox
 */
function addUserMessage(text, updateChatBoxContent) {
    if (text === null) return;

    let userHtml;
    if (text.toString() === "Bewertung") {
        userHtml = '<div class="message"><p class="userText eval">' + text + '</p></div>';
    } else {
        userHtml = '<div class="message"><p class="userText">' + text + '</p></div>';
    }

    // to add typing message of the chatbot
    userHtml += '<div class="message typing"><div class="message-botname">MindMate</div><div class="botText"><div class="avatar-wrapper"><img class="avatar" src="/img/ArgueTutorClosed.png"></div><div class="data-wrapper"><img src="/img/typing3.gif"></div></div></div>';

    updateChatBoxContent(userHtml);
}

const IDK_REPLY = "Ich habe nicht verstanden";
const EMAIL_RESULT = "E-Mail öffnen";

/**
 * requests response from backend
 *
 * @param text
 *          question
 * @param updateChatBoxContent
 *          method to update the chatbox with the bots response
 */
function getBotResponse(text, gpt, updateChatBoxContent, UUID) {
    text = text.toLowerCase(); // convert input text to lowercase

    // restart evaluation
    if (text.toLowerCase().includes("neustart")) {
        getResponse("Introduction", gpt, updateChatBoxContent, UUID);
        return;
    }

    getSmalltalkResponse(text, gpt, (response) => {

        if (response.includes("IDKresponse")) {
            updateChatBoxContent(getIDKResponse(gpt, updateChatBoxContent, UUID));
        } else {
            updateChatBoxContent(response);
        }
    }, UUID);
}


/**
 * get response from python chatterbot backend and update the chatbox with the received answer
 * @param text
 *          request of the user
 * @param gpt
 *          boolean if chatgpt option is activated
 * @param updateChatBoxContent
 *          function to update the chatbox (takes the html response as parameter)
 * @param UUID
 *          unique id of the session
 * @returns {null}
 */
function getResponse(text, gpt, updateChatBoxContent, UUID) {
    console.log(text)
    /*fetch(CHATBOT_URL + "/getResponse?gpt=" + gpt + "&msg=" + text,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
        })*/
    fetch(CHATBOT_URL + "/getResponse",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({gpt: gpt, text: text, uuid: UUID})
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            let botReply = data.botReply;
            addBotMessage(botReply, updateChatBoxContent);
            let state = data.state;
            if(state > 0){
                // update progress bar
                switch (state) {
                    case 3:
                        document.getElementById("general_progress").value = 20;
                        return;
                    case 4:
                        document.getElementById("general_progress").value = 40;
                        return;
                    case 5:
                        document.getElementById("general_progress").value = 60;
                        return;
                    case 6:
                        document.getElementById("general_progress").value = 80;
                        return;
                    case 7:
                        document.getElementById("general_progress").value = 100;
                        document.getElementById("open-insights-button").style.display = '';
                        return;
                }
            }
        });
}

function getSmalltalkResponse(text, gpt, andThen, UUID) {
    if (text.includes("joke") || text.includes("gag") || text.includes("wit") || text.includes("fun")) { // tell joke
        //text = "joke";
    }

    let response = getResponse(text, gpt, andThen, UUID);
    // interrupt/smalltalk
    if (evaluationRunning) {
    }
    return response;
}

function getIDKResponse(gpt, updateChatBoxContent, UUID) {
    IDKcounter++; // count IDK
    let botReply;
    if (IDKcounter < 2) {
        botReply = getResponse(IDK_REPLY, gpt, updateChatBoxContent, UUID);
    } else { // reply with email suggestion after 2 attempts
        botReply = getResponse(EMAIL_RESULT, gpt, updateChatBoxContent, UUID);
    }
    return botReply;
}

/**
 * submits message to the backend
 *
 * @param text
 *          message to submit
 * @param updateChatBoxContent
 *          method to update the chatbox content
 */
function submitMessage(text, gpt, updateChatBoxContent, UUID) {
    if (text.trim() === "") {
        return;
    }

    addUserMessage(text, updateChatBoxContent);
    document.getElementById("textInput").value = ""
    document.getElementById("buttonInput").disabled = true;
    document.getElementById("textInput").disabled = true;

    getBotResponse(text, gpt, updateChatBoxContent, UUID);
}

export {submitMessage}


/**
 * show privacy window
 */
function showPrivacy() {
    document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button, #open-insights-button, #general_progress").forEach(e => e.style.display = 'none');
    document.getElementById("feedback").style.display = 'none';
    document.getElementById("scrollbox").style.display = 'none';
    document.getElementById("userInput").style.display = 'none';
    document.getElementById("chatgpt").style.display = 'none';
    document.getElementById("privacy").style.display = 'inline-block';
}
export {showPrivacy}

/**
 * hide privacy window
 */
function hidePrivacy() {
    document.getElementById("privacy").style.display = 'none';

    document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button, #general_progress")
        .forEach(e => e.style.display = '');
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
}
export {hidePrivacy}

/**
 * displays open feedback button
 */
function showOpenFeedbackButton() {
    document.getElementById("close-feedback-button").style.display = 'none';
    document.getElementById("open-feedback-button").style.display = '';
}
export {showOpenFeedbackButton}

/**
 * displays close feedback button
 */
function showCloseFeedbackButton() {
    document.getElementById("close-feedback-button").style.display = '';
    document.getElementById("open-feedback-button").style.display = 'none';
}
export {showCloseFeedbackButton}

/**
 * hides feedback interface
 */
function hideFeedback() {
    document.getElementById("close-feedback-button").style.display = 'none';
    document.getElementById("feedback").style.display = 'none';

    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
}

export {hideFeedback}


function activateGPT() {
//    todo change color to green

}


function closeGPT() {

}

export {activateGPT, closeGPT}

/**
 * displays show detail (FAQ) interface
 */
function showDetail() {
    document.getElementById("open-feedback-button").style.display = 'none';
    document.getElementById("open-help-button").style.display = 'none';
    document.getElementById("open-Detail-button").style.display = 'none';
    document.getElementById("open-insights-button").style.display = 'none';
    document.getElementById("scrollbox").style.display = 'none';
    document.getElementById("userInput").style.display = 'none';
    document.getElementById("dashboard").style.display = 'none';
    document.getElementById("close-dashboard-button").style.display = 'none';

    document.getElementById("close-Detail-button").style.display = '';
    document.getElementById("Detail").style.display = 'inline-block';
}

export {showDetail}

/**
 * hides detail (FAQ) interface
 */
function hideDetail() {
    document.getElementById("Detail").style.display = 'none';
    document.getElementById("close-Detail-button").style.display = 'none';

    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
}

/**
 * hides detail (FAQ) interface
 */
function hideInsights() {
    document.getElementById("close-insights-button").style.display = 'none';

    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
}

export {hideInsights, hideDetail}

/**
 * hides essay interface
 */
function hideEssayField() {
    document.getElementById("ELEAIframeTemplate").style.display = 'none';
    document.getElementById("close-essay-field-button").style.display = 'none';
}

export {hideEssayField}

/**
 * shows chat interface
 */
function showChat() {
    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
    //document.getElementById("open-essay-page").style.display = '';
}
export {showChat}

/**
 * handles chat suggest calls from user
 *
 * @param chatBot
 *          current chatbot
 * @param text
 *          user message
 */
function chatSuggestCall(chatBot, gpt, text, UUID) {
    const elems = document.getElementsByClassName('chatSuggest');
    for (const elem of elems) {
        elem.disabled = true
    }

    document.getElementById("textInput").value = text;
    submitMessage(text, gpt, chatBot.updateChatBoxContent, UUID);
}
export {chatSuggestCall}

/**
 * hides help window interface
 */
function hideHelp() {
    document.getElementById("help").style.display = 'none';
    document.getElementById("close-help-button").style.display = 'none';

    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
}
export {hideHelp}

/**
 * clears the background colors of the boxes for subjectivity and polarity in the dashboard
 */
function clearDashboardBoxes() {
    //subjectivity
    document.getElementById("s1").style.backgroundColor = "";
    document.getElementById("s2").style.backgroundColor = "";
    document.getElementById("s3").style.backgroundColor = "";
    document.getElementById("s4").style.backgroundColor = "";
    document.getElementById("s5").style.backgroundColor = "";

    document.getElementById("s1_2").style.backgroundColor = "";
    document.getElementById("s2_2").style.backgroundColor = "";
    document.getElementById("s3_2").style.backgroundColor = "";
    document.getElementById("s4_2").style.backgroundColor = "";
    document.getElementById("s5_2").style.backgroundColor = "";

    //polarity
    document.getElementById("p1").style.backgroundColor = "";
    document.getElementById("p2").style.backgroundColor = "";
    document.getElementById("p3").style.backgroundColor = "";
    document.getElementById("p4").style.backgroundColor = "";
    document.getElementById("p5").style.backgroundColor = "";

    document.getElementById("p1_2").style.backgroundColor = "";
    document.getElementById("p2_2").style.backgroundColor = "";
    document.getElementById("p3_2").style.backgroundColor = "";
    document.getElementById("p4_2").style.backgroundColor = "";
    document.getElementById("p5_2").style.backgroundColor = "";
}


/**
 * Highlights the top 'n' sentences of 'sentsToHighlight' or all if it contains fewer than n elements
 *
 * @param text
 *          essay text
 * @param sentsToHighlight
 *          sentences to highlight
 * @param n
 *          number of sentences to highlight
 * @returns {string} html string containing the highlighted sentences
 */
function highlightTopNSentences(text, sentsToHighlight, n, title) {
    let html = "<span>" + text + "</span>";
    html = html.replaceAll('\n', '<br/>');

    let posIdx = 0;
    let negIdx = 0;
    let neutIdx = 0;
    for (let i = 0; i < Math.min(sentsToHighlight.length, n); i++) {
        let word = sentsToHighlight[i][0];
        let polarity = title + sentsToHighlight[i][1].toFixed(2);

        let posNeg = "";
        if (sentsToHighlight[i][1] >= 0.1) {
            posNeg = posIdx + "pos";
            posIdx++;
        } else if (sentsToHighlight[i][1] <= -0.1) {
            posNeg = negIdx + "neg";
            negIdx++;
        } else {
            posNeg = neutIdx + "neut";
            neutIdx++;
        }

        html = html.replace(word, '</span><span class=\"annotation-' + posNeg + '\" title=' + polarity + '>' + word + '</span>');
    }
    return html;
}


/**
 * Highlights the top 'n' polar sentences of 'sentsToHighlight' or all if it contains fewer than n elements
 *
 * @param text
 *          essay text
 * @param sentsToHighlight
 *          sentences to highlight
 * @param n
 *          number of sentences to highlight
 * @returns {string} html string containing the highlighted sentences
 */
function highlightTopNPolaritySentences(text, sentsToHighlight, n) {
    let title = 'Auf&nbsp;einer&nbsp;Skala&nbsp;von&nbsp;sehr&nbsp;negativ&nbsp;(-1)&nbsp;bis&nbsp;sehr&nbsp;positiv&nbsp;(1)&nbsp;ist&nbsp;dieser&nbsp;Satz:&nbsp;';

    return highlightTopNSentences(text, sentsToHighlight, n, title);
}
export {highlightTopNPolaritySentences}


/**
 * Highlights the top 'n' subjective sentences of 'sentsToHighlight' or all if it contains fewer than n elements
 *
 * @param text
 *          essay text
 * @param sentsToHighlight
 *          sentences to highlight
 * @param n
 *          number of sentences to highlight
 * @returns {string} html string containing the highlighted sentences
 */
function highlightTopNSubjectivitySentences(text, sentsToHighlight, n) {
    // to also display a value between -1 and 1
    let subjAdapted = sentsToHighlight.map(x => [x[0], 2*x[1] - 1]);
    let title = 'Auf&nbsp;einer&nbsp;Skala&nbsp;von&nbsp;sehr&nbsp;objektiv&nbsp;(-1)&nbsp;bis&nbsp;sehr&nbsp;subjektiv&nbsp;(1)&nbsp;ist&nbsp;dieser&nbsp;Satz:&nbsp;';

    return highlightTopNSentences(text, subjAdapted, n, title);
}

export {highlightTopNSubjectivitySentences}


/**
 * Extracts the top sentences in the list based on the value (used for polarity and subjectivity sources)
 *
 * @param value
 *          value on which to base the extraction
 * @param ascendingSentences
 *          ordered array
 * @returns {*[]|*} top sentences
 */
function getTopSentences(value, ascendingSentences) {
    let sentencesToHighlight;
    let length = ascendingSentences.length;
    if (value > 60) {
        sentencesToHighlight = ascendingSentences.slice(-2).reverse();
        if (value < 80 && length > 2) {
            sentencesToHighlight.push(ascendingSentences[0])
        }
    } else if (value < 40) {
        sentencesToHighlight = ascendingSentences.slice(0, 2);
        if (value > 20 && length > 2) {
            sentencesToHighlight.push(ascendingSentences[length - 1])
        }
    } else {
        sentencesToHighlight = length > 2
            ? [ascendingSentences[length - 1], ascendingSentences[0]]
            : ascendingSentences;
    }
    return sentencesToHighlight;
}
export {getTopSentences}

/**
 * highlights all words in the text that are contained in 'wordsToHighlight'
 *
 * @param text
 *          text in which to highlight
 * @param keyword
 *          words to be highlighted in the text
 * @returns {string}
 *          html string with the given highlights
 */
function highlightKeyword(text, keyword) {
    let html = "<span>" + text + "</span>";
    html = html.replaceAll('\n', '<br/>');

    // removes potential special characters in the beginning or at the end of the word
    let word = keyword.replace(/[.,!?]/g, "");


    console.log(keyword)
    // removes the first letter of the word and joins it in the end
    // words beginning with Umlauts cannot use the \b property in the RegExp since that doesn't support utf-8 characters
    if (word[0] === "ö" || word[0] === "Ö" || word[0] === "ä" || word[0] === "Ä" || word[0] === "ü" || word[0] === "Ü") {
        html = html.replace(new RegExp(word[0].toUpperCase() + word.slice(1), 'gu'), '</span><span class=\"annotation-0\">' + word[0].toUpperCase() + word.slice(1) + '</span>')
        html = html.replace(new RegExp(word[0].toLowerCase() + word.slice(1), 'gu'), '</span><span class=\"annotation-0\">' + word[0].toLowerCase() + word.slice(1) + '</span>')
    } else {
        html = html.replace(new RegExp("\\b" + word[0].toUpperCase() + word.slice(1) + "\\b", 'gu'), '</span><span class=\"annotation-0\">' + word[0].toUpperCase() + word.slice(1) + '</span>')
        html = html.replace(new RegExp("\\b" + word[0].toLowerCase() + word.slice(1) + "\\b", 'gu'), '</span><span class=\"annotation-0\">' + word[0].toLowerCase() + word.slice(1) + '</span>')
    }
    return html;
}

export {highlightKeyword}

/**
 * makes clickable links out the of the top keywords that enable highlighting them in the essay text
 *
 * @param text
 *          essay text
 * @param state
 *          current react state
 * @returns {string} adapted html string
 */
function addHighlighFunctionalityToTopKeywords(text, state) {
    let topKeywords = state.topKeywords.map(arr => arr[0]);

    for (let i = 0; i < topKeywords.length; i++) {
        let html = document.getElementById("topKeywordsDB").innerHTML;
        let replacement = '<a href="javascript:void(0);" onclick="highlightTopKeywordsWindow(\'' + topKeywords[i] + '\');">' + topKeywords[i] + '</a>';

        if (topKeywords[i][0] === "ö" || topKeywords[i][0] === "Ö" || topKeywords[i][0] === "ä" || topKeywords[i][0] === "Ä" || topKeywords[i][0] === "ü" || topKeywords[i][0] === "Ü") {
            html = html.replaceAll(new RegExp(topKeywords[i], 'gu'), replacement)
        } else {
            html = html.replaceAll(new RegExp("\\b" + topKeywords[i] + "\\b", 'gu'), replacement);
        }


        document.getElementById("topKeywordsDB").innerHTML = html;
    }

    let html = "<span>" + text + "</span>";
    return html.replaceAll('\n', '<br/>');
}


/**
 * computes the dashboard elements based on the given arguments
 *
 * @param subjectivity
 * @param polarity
 * @param userText
 * @param sentences
 * @param addOnClickToReloadPage
 * @param state
 */
function computeDashboard(analysis_subjectivity,analysis_polarity,evaluation_subjectivity,evaluation_polarity, userText, addOnClickToReloadPage, state) {
    let box_ana = "s";
    let box_eva = "s";
    let box2_ana = "p";
    let box2_eva = "p";

    clearDashboardBoxes();

    document.getElementById("dashboard").style.display = 'inline-block';
    addOnClickToReloadPage()

    document.getElementById("userInput").style.display = 'none';

    document.getElementById('userDashboardText').innerHTML = addHighlighFunctionalityToTopKeywords(userText, state);


    if (0.0 <= analysis_subjectivity && analysis_subjectivity <= 0.2) box_ana += "1";
    if (0.2 < analysis_subjectivity && analysis_subjectivity <= 0.4) box_ana += "2";
    if (0.4 < analysis_subjectivity && analysis_subjectivity <= 0.6) box_ana += "3";
    if (0.6 < analysis_subjectivity && analysis_subjectivity <= 0.8) box_ana += "4";
    if (0.8 < analysis_subjectivity && analysis_subjectivity <= 1.0) box_ana += "5";
    document.getElementById(box_ana).style.backgroundColor = "rgba(173, 216, 230, 1)";

    if (0.0 <= evaluation_subjectivity && evaluation_subjectivity <= 0.2) box_eva += "1";
    if (0.2 < evaluation_subjectivity && evaluation_subjectivity <= 0.4) box_eva += "2";
    if (0.4 < evaluation_subjectivity && evaluation_subjectivity <= 0.6) box_eva += "3";
    if (0.6 < evaluation_subjectivity && evaluation_subjectivity <= 0.8) box_eva += "4";
    if (0.8 < evaluation_subjectivity && evaluation_subjectivity <= 1.0) box_eva += "5";
    box_eva += "_2";
    document.getElementById(box_eva).style.backgroundColor = "rgba(173, 216, 230, 1)";

    if (-1.0 <= analysis_polarity && analysis_polarity <= -0.6) box2_ana += "1";
    if (-0.6 < analysis_polarity && analysis_polarity <= -0.2) box2_ana += "2";
    if (-0.2 < analysis_polarity && analysis_polarity <= 0.2) box2_ana += "3";
    if (0.2 < analysis_polarity && analysis_polarity <= 0.6) box2_ana += "4";
    if (0.6 < analysis_polarity && analysis_polarity <= 1.0) box2_ana += "5";

    document.getElementById(box2_ana).style.backgroundColor = "rgba(173, 216, 230, 1)";

    if (-1.0 <= evaluation_polarity && evaluation_polarity <= -0.6) box2_eva += "1";
    if (-0.6 < evaluation_polarity && evaluation_polarity <= -0.2) box2_eva += "2";
    if (-0.2 < evaluation_polarity && evaluation_polarity <= 0.2) box2_eva += "3";
    if (0.2 < evaluation_polarity && evaluation_polarity <= 0.6) box2_eva += "4";
    if (0.6 < evaluation_polarity && evaluation_polarity <= 1.0) box2_eva += "5";
    box2_eva += "_2";
    document.getElementById(box2_eva).style.backgroundColor = "rgba(173, 216, 230, 1)";

    //writtenReflectionFeedback(score);

    document.getElementById("open-feedback-button").style.display = 'none';
    document.getElementById("open-Detail-button").style.display = 'none';
    document.getElementById("open-insights-button").style.display = 'none';
    document.getElementById("open-help-button").style.display = 'none';
    document.getElementById("close-help-button").style.display = 'none';
    document.getElementById("scrollbox").style.display = 'none';
    document.getElementById("userInput").style.display = 'none';

    document.getElementById("close-dashboard-button").style.display = '';

    Swal({
        title: 'Your Dashboard is ready!',
        text: 'You can now view the analysis results. This is the last screen. To start the process again, you can scroll down and return to the introduction!',
        icon: 'success',
        confirmButtonText: 'Show results',
        confirmButtonColor: '#00762C'
    })
}

export {computeDashboard}

/**
 * Computes the displayed text based on the polarity of the essay. used for the body
 *
 * @param polarity
 *          polarity of the essay
 */
function writtenPolarity(polarity) {
    let result;
    if (-1.0 <= polarity && polarity <= -0.6) {
        result = "The body is written in a very negative way. It seems that you had a very bad experience so try to think about how you would improve that in the future."
    }
    if (-0.6 < polarity && polarity <= -0.2) {
        result = "The body is written in a negative way. It seems that your text contains some negative terms and is therefore placed in this section, so try to think about how you would improve this kind of experiences in the future."
    }
    if (-0.2 < polarity && polarity <= 0.2) {
        result = "The body is written in a neutral way. There are no extremes in terms of positivity or negativity. This is maybe sign that you didn't express enough sentiments/feelings in your analysis"
    }
    if (0.2 < polarity && polarity <= 0.6) {
        result = "The body is written in a positive way. It seems that your text contains some positive terms and is therefore classified in this area which is a sign that you had a good experience so try to think about the factors that lead to this."
    }
    if (0.6 < polarity && polarity <= 1.0) {
        result = "The body is written in a very positive way. It seems as if your text contains many positive terms and is therefore placed in this section, which is a sign that you had a good experience so try to think about the factors that lead to this."
    }
    document.getElementById("writtenPolarity").innerText = result;
}

// TODO remove this maybe
/**
 * Computes the displayed text based on the polarity of the essay
 *
 * @param polarity
 *          polarity of the essay
 */
function writtenPolarity_conclusion(polarity) {
    let result;
    if (-1.0 <= polarity && polarity <= -0.6) {
        result = "The conclusion is written in a very negative way. It seems that your text contains many negative terms and is therefore placed in this section. If you reflected about a bad experience try to be more optimistic about how you would improve this in the future."
    }
    if (-0.6 < polarity && polarity <= -0.2) {
        result = "The conclusion is written in a negative way. It seems that your text contains some negative terms and is therefore placed in this section. If you reflected about a bad experience try to be more optimistic about how you would improve this in the future."
    }
    if (-0.2 < polarity && polarity <= 0.2) {
        result = "The conclusion is written in a neutral way. There are no extremes in terms of positivity or negativity. If you "
    }
    if (0.2 < polarity && polarity <= 0.6) {
        result = "The conclusion is written in a positive way. It seems that your text contains some positive terms and is therefore classified in this area."
    }
    if (0.6 < polarity && polarity <= 1.0) {
        result = "The conclusion is written in a very positive way. It seems as if your text contains many positive terms and is therefore placed in this section."
    }
    //document.getElementById("writtenPolarity_2").innerText = result;
}

/**
 * Computes the displayed text based on the subjectivity of the essay
 *
 * @param subjectivity
 *          subjectivity of the essay
 */
function writtenSubjectivity(subjectivity) {
    let result; //0 very objective/1 very subjective
    if (0.0 <= subjectivity && subjectivity <= 0.2) {
        result = "The introduction is written very objectively. This means that you have written a text that contains almost no personal opinions. This is a good point since you likely provide include objective elements such as a brief overview of the experience and relevant background information."
    }
    if (0.2 < subjectivity && subjectivity <= 0.4) {
        result = "The introduction is written objectively. This means that you have written a text that contains few personal opinions. This is a good point since you likely provide include objective elements such as a brief overview of the experience and relevant background information."
    }
    if (0.4 < subjectivity && subjectivity <= 0.6) {
        result = "The introduction contains some subjective elements. This is very good since you likely used elements such as personal anecdotes or feelings about the experience and also objective elements such as a brief overview of the experience and relevant background information."
    }
    if (0.6 < subjectivity && subjectivity <= 0.8) {
        result = "The introduction contains some strongly subjective elements, i.e. you have included a certain amount of subjective opinion and less fact-based information in your text. This could be improved by providing more overview of the experience and relevant background information."
    }
    if (0.8 < subjectivity && subjectivity <= 1.0) {
        result = "The introduction contains a lot of subjective elements. This means that you have included a lot of subjective opinions in your text and almost no fact-based information. This could be improved by providing more overview of the experience and relevant background information."
    }
    document.getElementById("writtenSubjectivity").innerText = result;
}

/**
 * Computes the displayed text based on the subjectivity of the essay
 *
 * @param subjectivity
 *          subjectivity of the essay
 */
function writtenSubjectivity_body(subjectivity) {
    let result; //0 very objective/1 very subjective
    if (0.0 <= subjectivity && subjectivity <= 0.2) {
        result = "The body is written very objectively. This means that you have written a text that contains almost no personal opinions. You should reflect more about the emotions or thoughts that arose during the experience. "
    }
    if (0.2 < subjectivity && subjectivity <= 0.4) {
        result = "The body is written objectively. This means that you have written a text that contains few personal opinions. You should reflect more about the emotions or thoughts that arose during the experience. "
    }
    if (0.4 < subjectivity && subjectivity <= 0.6) {
        result = "The body contains some subjective elements. This means that you have written a text that contains some personal opinions but also some factual information. This is good since you likely describe the experience in detail, including any emotions or thoughts that arose and also external factors that may have influenced the experience."
    }
    if (0.6 < subjectivity && subjectivity <= 0.8) {
        result = "The body contains some strongly subjective elements, i.e. you have included a certain amount of subjective opinion and less fact-based information in your text. You should reflect more about the external factors that may have influenced the experience. "
    }
    if (0.8 < subjectivity && subjectivity <= 1.0) {
        result = "The body contains a lot of subjective elements. This means that you have included a lot of subjective opinions in your text and almost no fact-based information. You should reflect more about the external factors that may have influenced the experience. "
    }
    document.getElementById("writtenSubjectivity_2").innerText = result;
}
/**
 * Computes the displayed text based on the reflection score of the essay
 *
 * @param reflectionScore
 *          reflection score of the essay
 */
function writtenReflectionFeedback(reflectionScore) {
    let result;
    if (0.0 <= reflectionScore && reflectionScore <= 0.2) {
        result = "Your text lacks in reflection. This means that you have written a text that contains almost no self critical thinking, but a lot of fact-based information."
    }
    if (0.2 < reflectionScore && reflectionScore <= 0.4) {
        result = "Your text lacks in reflection. This means that you have written a text that contains few self critical thinking but more factual information."
    }
    if (0.4 < reflectionScore && reflectionScore <= 0.6) {
        result = "Your text contains some reflection elements. This means that you have written a text that contains some self critical thinking but also some factual information."
    }
    if (0.6 < reflectionScore && reflectionScore <= 0.8) {
        result = "Your text contains some strong reflection elements, i.e. you have included a certain amount of self critical thinking and less fact-based information in your text."
    }
    if (0.8 < reflectionScore && reflectionScore <= 1.0) {
        result = "Your text contains a lot of reflection elements. This means that you have included a lot of self critical thinking in your text and almost no fact-based information."
    }
    document.getElementById("writtenReflectionFeedback").innerText = result;

}

/**
 * Computes the displayed text based on the reflection of approriate tenses and pronouns in the essay
 *
 * @param reflectionScore
 *          reflection score of the essay
 */
function writtenTensesPronouns(pronouns, past_intro, future_conclusion) {
    let result = "";
    if (3 > pronouns) {
        result += "You didn't use much first person pronouns in your text. This may show a lack of self reflection and description of how the experience impacted you. I suggest you center the essay on yourself next time."
    }
    else {
        result += "It seems that you use quiet often self centered sentences. This is a sign of a good self reflection 👍"
    }
    if(past_intro < 3){
        result += "You should use more of the past tense in the introduction. This shows the context description of the experience you had"
    }
    else {
        result += "It seems that you described the context of the past experience in the introduction"
    }
    if(future_conclusion == 0){
        result += "Also, you should use more of the future tense in the conclusion. This proves how you project yourself in future experiences"
    }
    else {
        result += "Also, it seems that you mentioned how to improve future such experiences 👍"
    }

    document.getElementById("tenses_pronouns").innerText = result;

}