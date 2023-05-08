import Swal from "sweetalert";


let IDKcounter = 0;

let evaluationRunning = false;

const CHATBOT_URL = "http://127.0.0.1:8006";
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
 * Initializes chatbot and gets first response
 *
 * @param updateChatBoxContent
 *          function that updates the chat box with the argument passed to it
 */
function initializeBot(updateChatBoxContent) {
    getFirstResponse(updateChatBoxContent);
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
 * Loads intro message
 *
 * @param updateChatBoxContent
 *          function that updates the chatbox with the given value passed as argument
 */
function getFirstResponse(updateChatBoxContent) {
    getResponse("Einführung", updateChatBoxContent);
}

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
function getBotResponse(text, updateChatBoxContent) {
    text = text.toLowerCase(); // convert input text to lowercase

    // restart evaluation
    if (text.toLowerCase().includes("neustart")) {
        getResponse("Einführung", updateChatBoxContent);
        return;
    }

    getSmalltalkResponse(text, (response) => {

        if (response.includes("IDKresponse")) {
            updateChatBoxContent(getIDKResponse(updateChatBoxContent));
        } else {
            updateChatBoxContent(response);
        }
    });
}


/**
 * get response from python chatterbot backend and update the chatbox with the received answer
 * @param text
 *          request of the user
 * @param updateChatBoxContent
 *          function to update the chatbox (takes the html response as parameter)
 * @returns {null}
 */
function getResponse(text, updateChatBoxContent) {
    fetch(CHATBOT_URL + "/getResponse?msg=" + text,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            let botReply = data.botReply;
            addBotMessage(botReply, updateChatBoxContent);
        });
}

function getSmalltalkResponse(text, andThen) {
    if (text.includes("joke") || text.includes("gag") || text.includes("wit") || text.includes("fun")) { // tell joke
        text = "Erzähl mir einen Witz";
    }

    let response = getResponse(text, andThen);
    // interrupt/smalltalk
    if (evaluationRunning) {
    }
    return response;
}

function getIDKResponse(updateChatBoxContent) {
    IDKcounter++; // count IDK
    let botReply;
    if (IDKcounter < 2) {
        botReply = getResponse(IDK_REPLY, updateChatBoxContent);
    } else { // reply with email suggestion after 2 attempts
        botReply = getResponse(EMAIL_RESULT, updateChatBoxContent);
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
function submitMessage(text, updateChatBoxContent) {
    if (text.trim() === "") {
        return;
    }

    addUserMessage(text, updateChatBoxContent);
    document.getElementById("textInput").value = ""
    document.getElementById("buttonInput").disabled = true;
    document.getElementById("textInput").disabled = true;

    getBotResponse(text, updateChatBoxContent);
}

export {submitMessage}


/**
 * show privacy window
 */
function showPrivacy() {
    document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button").forEach(e => e.style.display = 'none');
    document.getElementById("feedback").style.display = 'none';
    document.getElementById("scrollbox").style.display = 'none';
    document.getElementById("userInput").style.display = 'none';
    document.getElementById("privacy").style.display = 'inline-block';
}
export {showPrivacy}

/**
 * hide privacy window
 */
function hidePrivacy() {
    document.getElementById("privacy").style.display = 'none';

    document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button")
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

/**
 * displays show detail (FAQ) interface
 */
function showDetail() {
    document.getElementById("open-feedback-button").style.display = 'none';
    document.getElementById("open-help-button").style.display = 'none';
    document.getElementById("open-Detail-button").style.display = 'none';
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

export {hideDetail}

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
    document.getElementById("open-essay-page").style.display = '';
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
function chatSuggestCall(chatBot, text) {
    const elems = document.getElementsByClassName('chatSuggest');
    for (const elem of elems) {
        elem.disabled = true
    }

    document.getElementById("textInput").value = text;
    submitMessage(text, chatBot.updateChatBoxContent);
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

    //polarity
    document.getElementById("p1").style.backgroundColor = "";
    document.getElementById("p2").style.backgroundColor = "";
    document.getElementById("p3").style.backgroundColor = "";
    document.getElementById("p4").style.backgroundColor = "";
    document.getElementById("p5").style.backgroundColor = "";
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
function computeDashboard(subjectivity, polarity, userText, sentences, addOnClickToReloadPage, state) {
    let box = "s";
    let box2 = "p";

    clearDashboardBoxes();

    document.getElementById("dashboard").style.display = 'inline-block';
    addOnClickToReloadPage()

    document.getElementById("userInput").style.display = 'none';

    document.getElementById('userDashboardText').innerHTML = addHighlighFunctionalityToTopKeywords(userText, state);

    if (0.0 <= subjectivity && subjectivity <= 0.2) box += "1";
    if (0.2 < subjectivity && subjectivity <= 0.4) box += "2";
    if (0.4 < subjectivity && subjectivity <= 0.6) box += "3";
    if (0.6 < subjectivity && subjectivity <= 0.8) box += "4";
    if (0.8 < subjectivity && subjectivity <= 1.0) box += "5";
    document.getElementById(box).style.backgroundColor = "rgba(0,255, 0, 0.75)";

    if (-1.0 <= polarity && polarity <= -0.6) box2 += "1";
    if (-0.6 < polarity && polarity <= -0.2) box2 += "2";
    if (-0.2 < polarity && polarity <= 0.2) box2 += "3";
    if (0.2 < polarity && polarity <= 0.6) box2 += "4";
    if (0.6 < polarity && polarity <= 1.0) box2 += "5";

    document.getElementById(box2).style.backgroundColor = "rgba(0,255, 0, 0.75)";
    writtenPolarity(polarity);
    writtenSubjectivity(subjectivity);

    document.getElementById("open-feedback-button").style.display = 'none';
    document.getElementById("open-Detail-button").style.display = 'none';
    document.getElementById("open-help-button").style.display = 'none';
    document.getElementById("close-help-button").style.display = 'none';
    document.getElementById("scrollbox").style.display = 'none';
    document.getElementById("userInput").style.display = 'none';

    document.getElementById("close-dashboard-button").style.display = '';

    Swal({
        title: 'Ihr Dashboard ist fertig!',
        text: 'Sie können sich nun die Analyseergebnisse ansehen. Dies ist der letzte Bildschirm. Um den Prozess erneut zu starten, können Sie nach unten scrollen und zur Einleitung zurückkehren!',
        icon: 'success',
        confirmButtonText: 'Ergebnisse anzeigen',
        confirmButtonColor: '#00762C'
    })
}

export {computeDashboard}

/**
 * Computes the displayed text based on the polarity of the essay
 *
 * @param polarity
 *          polarity of the essay
 */
function writtenPolarity(polarity) {
    let result;
    if (-1.0 <= polarity && polarity <= -0.6) {
        result = "Ihr Text ist sehr negativ geschrieben. Es scheint so, als ob Ihr Text viele negative Begriffe enthält und deshalb in diesen Abschnitt eingeordnet wird."
    }
    if (-0.6 < polarity && polarity <= -0.2) {
        result = "Ihr Text ist negativ geschrieben. Es scheint, als ob Ihr Text einige negative Begriffe enthält und deshalb in diesen Abschnitt eingeordnet wird."
    }
    if (-0.2 < polarity && polarity <= 0.2) {
        result = "Ihr Text ist neutral geschrieben. Es gibt keine Extreme in Bezug auf Positivität oder Negativität."
    }
    if (0.2 < polarity && polarity <= 0.6) {
        result = "Ihr Text ist positiv geschrieben. Es scheint, dass Ihr Text einige positive Begriffe enthält und daher in diesen Bereich eingeordnet wird."
    }
    if (0.6 < polarity && polarity <= 1.0) {
        result = "Ihr Text ist sehr positiv geschrieben. Es scheint, als ob Ihr Text viele positive Begriffe enthält und deshalb in diesen Abschnitt eingeordnet wird."
    }
    document.getElementById("writtenPolarity").innerText = result;
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
        result = "Ihr Text ist sehr objektiv geschrieben. Das bedeutet, dass Sie einen Text verfasst haben, der fast keine persönlichen Meinungen enthält, sondern viele faktenbasierte Informationen."
    }
    if (0.2 < subjectivity && subjectivity <= 0.4) {
        result = "Ihr Text ist objektiv geschrieben. Das bedeutet, dass Sie einen Text verfasst haben, der wenige persönliche Meinungen, aber mehr sachliche Informationen enthält."
    }
    if (0.4 < subjectivity && subjectivity <= 0.6) {
        result = "Ihr Text enthält einige subjektive Elemente. Das bedeutet, dass Sie einen Text geschrieben haben, der einige persönliche Meinungen, aber auch einige sachliche Informationen enthält."
    }
    if (0.6 < subjectivity && subjectivity <= 0.8) {
        result = "Ihr Text enthält einige stark subjektive Elemente, d.h. Sie haben ein gewisses Maß an subjektiver Meinung und weniger faktenbasierte Informationen in Ihren Text eingebaut."
    }
    if (0.8 < subjectivity && subjectivity <= 1.0) {
        result = "Ihr Text enthält eine Menge subjektiver Elemente. Das bedeutet, dass Sie eine Menge subjektiver Meinungen in Ihren Text eingebaut haben und fast keine faktenbasierten Informationen."
    }
    document.getElementById("writtenSubjectivity").innerText = result;
}