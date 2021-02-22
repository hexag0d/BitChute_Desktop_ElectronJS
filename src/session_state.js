session = require('electron').remote.session; // @TODO make this non-global
super_agent_type = require('superagent');

cookie_jar = require('cookiejar');

var custom_events = require('../vm/event_generators.js')

module.exports = {
    buildCookie,
    getCookiesFromSession,
    saveAllCookiesFromSetCookie,
    clearCookies,
    getAnyCookieValueFromSession
}

ffmpeg_path = undefined;

async function getAnyCookieValueFromSession(cookieName) {
    var _cookies = await session.defaultSession.cookies.get({ domain: 'www.bitchute.com' });
    for (i = 0; i < _cookies.length; i++) {
        if (_cookies[i].name == cookieName) {
            return _cookies[i].value;
        }
    }
}

/**
 * 
 * @param {any} cookieString the raw string to extract value from
 * 
 * @param {any} strValue 'expires' || 'val' = firstMatchValue || use any other value to get
 */
function getCookieValue(cookieString, strValue) {
    try {
        var pieces = cookieString.split(';');
        for (i = 0; i < pieces.length; i++) {
            if (strValue == 'expires') {
                if (pieces[i].match('expires=')) {
                    return Date.parse(pieces[i].split('=')[1]) / 1000;
                }
            } else if (strValue == 'val') {
                return pieces[0].split('=')[1];
            } else {
                if (pieces[i].match(strValue)) {
                    return pieces[i].split('=')[1];
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

cookieState = undefined;

function castFromSessionToCookie(cookieJson) {
    console.log(serializeCookieFromJson(cookieJson));
    var cookieCast = new cookie_jar.Cookie().parse(serializeCookieFromJson(cookieJson));
    console.log(cookieCast);
    return cookieCast;
}

/**
 * 
 * @param {boolean} onInitialLoad was the request on initial app load (not used yet)
 * @param {super_agent_type} agent optional superagent instance to add request headers
 */

reqcookie = undefined;

async function getCookiesFromSession(onInitialLoad, agent, shouldAwaitResponse) {
    var sessionStillValid = false;
    var freshCookies = undefined;
    var req = session.defaultSession.cookies.get({ url: 'https://www.bitchute.com/' });
    reqcookie = req;
    if (shouldAwaitResponse) {
        cookies = await req;
        console.log(cookies);
        freshCookies = '';
        for (i = 0; i < cookies.length;i++) {
            freshCookies += serializeCookieFromJson(cookies[i]);
        }
        console.log(freshCookies);
        agent.set('Cookie', freshCookies);
        return agent;
    } else {
            req.then((cookies) => {
            freshCookies = '';
            for (var cooki in cookies) {
                freshCookies += serializeCookieFromJson(cookies[cookie]);
            } if (agent != null) {
                agent.jar.setCookie(freshCookies, 'https://www.bitchute.com/', '/');

                return agent;
            } else {
                return freshCookies;
            }
        }).catch((error) => {
            console.log(error)
        })
    }
}

function superAgentCookieCast(jsonObject) {

}

function buildCookie(setCookieAfterBuild, csrftoken, cfduid, sessionid, anyCookie) {
    var newCookie = undefined;
    var cookieJson = undefined;
    if (csrftoken != null) {
        cookieJson = {
            url: 'https://www.bitchute.com',
            name: 'csrftoken',
            value: getCookieValue(csrftoken, 'val'),
            secure: true,
            sameSite: 'lax'
        }
    }
    else if (cfduid != null) {
        cookieJson = {
            url: 'https://www.bitchute.com',
            name: '__cfduid',
            value: getCookieValue(cfduid, 'val'),
            secure: true,
            sameSite: 'lax',
            httpOnly: true,
            expirationDate: getCookieValue(cfduid, 'expires')
        }
    }
    else if (sessionid != null) {
        cookieJson = {
            url: 'https://www.bitchute.com',
            name: 'sessionid',
            value: getCookieValue(sessionid, 'val'),
            secure: true,
            sameSite: 'lax',
            httpOnly: true,
            expirationDate: getCookieValue(sessionid, 'expires')
        }
    } else if (anyCookie != null) {
        cookieJson = {
            url: 'https://www.bitchute.com',
            name: anyCookie.name,
            value: anyCookie.value
        }
    }
    if (setCookieAfterBuild) {
        console.log(cookieJson);
        session.defaultSession.cookies.set(cookieJson)
            .then((cookies) => { })
            .catch((err) => { console.log(err.message); })
    }
}

function serializeCookieFromJson(cookieJsonObject) {
    var serial = '';
    var nameKey = '';
    for (var key in cookieJsonObject) {
        if (cookieJsonObject.hasOwnProperty(key)) {
            if (key === "name") {
                if (nameKey == '') {
                    nameKey = cookieJsonObject[key] + '=';
                }
                else {
                    nameKey += cookieJsonObject[key] + ';';
                }
            }
            if (key === 'value') {
                if (nameKey == '') {
                    nameKey = cookieJsonObject[key] + '=';
                }
                else {
                    nameKey += cookieJsonObject[key] + ';';
                }
            }
        }
    }
    serial = nameKey;
    console.log(nameKey);
    return serial;
}

function saveAllCookiesFromSetCookie(cookieArray) {
    if (cookieArray != null) {
        for (i = 0; i < cookieArray.length; i++) {
            try {
                if (cookieArray[i].match('__cfduid=')) {
                    buildCookie(true, null, cookieArray[i], null);
                }
                else if (cookieArray[i].match('csrftoken=')) {
                    buildCookie(true, cookieArray[i], null, null);
                }
                else if (cookieArray[i].match('sessionid=')) {
                    buildCookie(true, null, null, cookieArray[i]);
                }
            } catch (err) { console.log(err);}
        }
    }
}

function clearCookies() {
    session.defaultSession.cookies.remove('https://www.bitchute.com', 'sessionid');
    session.defaultSession.cookies.remove('https://www.bitchute.com', '__cfduid');
    session.defaultSession.cookies.remove('https://www.bitchute.com', 'csrftoken');
}

/*
 Instance Methods

The following methods are available on instances of Cookies:
cookies.get(filter)

    filter Object
        url String (optional) - Retrieves cookies which are associated with url. Empty implies retrieving cookies of all URLs.
        name String (optional) - Filters cookies by name.
        domain String (optional) - Retrieves cookies whose domains match or are subdomains of domains.
        path String (optional) - Retrieves cookies whose path matches path.
        secure Boolean (optional) - Filters cookies by their Secure property.
        session Boolean (optional) - Filters out session or persistent cookies.

Returns Promise<Cookie[]> - A promise which resolves an array of cookie objects.

Sends a request to get all cookies matching filter, and resolves a promise with the response.
cookies.set(details)

    details Object
        url String - The URL to associate the cookie with. The promise will be rejected if the URL is invalid.
        name String (optional) - The name of the cookie. Empty by default if omitted.
        value String (optional) - The value of the cookie. Empty by default if omitted.
        domain String (optional) - The domain of the cookie; this will be normalized with a preceding dot so that it's also valid for subdomains. Empty by default if omitted.
        path String (optional) - The path of the cookie. Empty by default if omitted.
        secure Boolean (optional) - Whether the cookie should be marked as Secure. Defaults to false.
        httpOnly Boolean (optional) - Whether the cookie should be marked as HTTP only. Defaults to false.
        expirationDate Double (optional) - The expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted then the cookie becomes a session cookie and will not be retained between sessions.
        sameSite String (optional) - The Same Site policy to apply to this cookie. Can be unspecified, no_restriction, lax or strict. Default is no_restriction.

Returns Promise<void> - A promise which resolves when the cookie has been set

Sets a cookie with details.
cookies.remove(url, name)

    url String - The URL associated with the cookie.
    name String - The name of cookie to remove.

Returns Promise<void> - A promise which resolves when the cookie has been removed

Removes the cookies matching url and name
cookies.flushStore()

Returns Promise<void> - A promise which resolves when the cookie store has been flushed

Writes any unwritten cookies data to disk.
 
 
 */