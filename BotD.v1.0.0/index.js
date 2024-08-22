function detectBot(combinedRules) {
  let botInfo = {
    isBot: false,
    botKind: null,
    detectedRules: [],
    browserDetails: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      plugins: Array.from(navigator.plugins).map(p => p.name),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      webdriver: navigator.webdriver,
      automationControlled: navigator.automationControlled,
      languages: navigator.languages,
      productSub: navigator.productSub,
      maxTouchPoints: navigator.maxTouchPoints,
      process: getProcessInfo(),
      android: isAndroid(),
      browserKind: getBrowserKind(),
      browserEngineKind: getBrowserEngineKind(),
      mimeTypesConsistent: checkMimeTypesConsistency(),
      evalLength: getEvalLength(),
      inconsistentEval: detectInconsistentEval(),
      webGL: getWebGLInfo(),
      windowExternal: getWindowExternal()
    },
    detectionTime: new Date().toUTCString().replace(" GMT", " +0000"),
    detectorsResults: {},
  };

  function detectInconsistentEval() {
  let length = eval.toString().length;
  let userAgent = navigator.userAgent.toLowerCase();
  let browser;

  if (userAgent.indexOf("edg/") !== -1) {
    browser = "edge";
  } else if (
    userAgent.indexOf("trident") !== -1 ||
    userAgent.indexOf("msie") !== -1
  ) {
    browser = "internet_explorer";
  } else if (userAgent.indexOf("firefox") !== -1) {
    browser = "firefox";
  } else if (
    userAgent.indexOf("opera") !== -1 ||
    userAgent.indexOf("opr") !== -1
  ) {
    browser = "opera";
  } else if (userAgent.indexOf("chrome") !== -1) {
    browser = "chrome";
  } else if (userAgent.indexOf("safari") !== -1) {
    browser = "safari";
  } else {
    browser = "unknown";
  }

  if (browser === "unknown") return false;

  return (
    (length === 33 && !["chrome", "opera", "edge"].includes(browser)) ||
    (length === 37 && !["firefox", "safari"].includes(browser)) ||
    (length === 39 && !["internet_explorer"].includes(browser))
  );
}

  function getComponentState(value) {
    return value !== null && value !== undefined ? 'Success' : 'Failure';
  }

  // Initialize component values
  botInfo.appVersion = { value: navigator.appVersion, state: getComponentState(navigator.appVersion) };
  botInfo.userAgent = { value: navigator.userAgent, state: getComponentState(navigator.userAgent) };
  botInfo.webDriver = { value: navigator.webdriver, state: getComponentState(navigator.webdriver) };
  botInfo.languages = { value: navigator.languages, state: getComponentState(navigator.languages) };
  botInfo.productSub = { value: navigator.productSub, state: getComponentState(navigator.productSub) };
  botInfo.pluginsArray = { value: Array.from(navigator.plugins).map(p => p.name), state: getComponentState(navigator.plugins) };
  botInfo.pluginsLength = { value: navigator.plugins.length, state: getComponentState(navigator.plugins.length) };
  botInfo.windowSize = {
    value: {
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    },
    state: getComponentState(window.outerWidth)
  };

  function getProcessInfo() {
    return typeof process !== 'undefined' ? process : null;
  }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function getBrowserKind() {
    const ua = navigator.userAgent;
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua)) return 'Safari';
    if (/MSIE|Trident/i.test(ua)) return 'IE';
    if (/Edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  function getBrowserEngineKind() {
    const ua = navigator.userAgent;
    if (/Gecko/i.test(ua) && !/like Gecko/i.test(ua)) return 'Gecko';
    if (/WebKit/i.test(ua)) return 'WebKit';
    if (/Trident/i.test(ua)) return 'Trident';
    if (/EdgeHTML/i.test(ua)) return 'EdgeHTML';
    return 'Unknown';
  }

  function checkMimeTypesConsistency() {
    const mimeTypes = navigator.mimeTypes;
    const expectedTypes = ['application/pdf', 'text/plain', 'application/xml'];
    return expectedTypes.every(type => Array.from(mimeTypes).some(mt => mt.type === type));
  }

  function getEvalLength() {
    try {
      return eval.toString().length;
    } catch (e) {
      return null;
    }
  }

  function getWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER)
    };
  }

  function getWindowExternal() {
    if (typeof window.external !== 'undefined') {
      return {
        present: true,
        properties: Object.getOwnPropertyNames(window.external)
      };
    }
    return { present: false };
  }

  botInfo.documentFocus = { value: document.hasFocus(), state: getComponentState(document.hasFocus) };
  botInfo.rtt = { value: navigator.connection ? navigator.connection.rtt : null, state: getComponentState(navigator.connection && navigator.connection.rtt) };
  botInfo.errorTrace = { value: getErrorTrace(), state: getComponentState(getErrorTrace()) };
  botInfo.documentElementKeys = { value: Object.keys(document.documentElement), state: getComponentState(document.documentElement) };
  botInfo.functionBind = { value: Function.prototype.bind.toString(), state: getComponentState(Function.prototype.bind) };
  botInfo.distinctiveProps = {
    value: {
      awesomium: 'awesomium' in window,
      cef: 'cef' in window,
      phantom: 'phantom' in window || '_phantom' in window,
      selenium: '_selenium' in window || 'callSelenium' in window || 'webdriver' in window,
      webdriver: 'webdriver' in window,
      domAutomation: 'domAutomation' in window || 'domAutomationController' in window,
    },
    state: 'Success'
  };
  botInfo.notificationPermissions = { value: getNotificationPermissions(), state: getComponentState(Notification) };

  function getErrorTrace() {
    try {
      throw new Error();
    } catch (error) {
      return error.stack;
    }
  }

  function getNotificationPermissions() {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return null;
  }

  function evaluateCondition(condition, botInfo) {
    try {
      return new Function('botInfo', `with(botInfo) { return ${condition}; }`)(botInfo);
    } catch (error) {
      console.warn(`Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  if (!Array.isArray(combinedRules)) {
    console.warn('Invalid rules structure. Expected an array of rules.');
    return botInfo;
  }

  combinedRules.forEach((rule, index) => {
    if (!rule || typeof rule !== 'object') {
      console.warn(`Invalid rule at index ${index}:`, rule);
      return;
    }

    let ruleResult = { ruleName: rule.name || `Rule ${index}`, detected: false, details: {} };

    if (Array.isArray(rule.parameters) && Array.isArray(rule.conditions)) {
      const parameterValues = {};
      rule.parameters.forEach(param => {
        if (param && param.name) {
          parameterValues[param.name] = botInfo[param.name];
        }
      });

      ruleResult.details.parameters = parameterValues;

      rule.conditions.forEach(condition => {
        if (condition && typeof condition.condition === 'string') {
          if (evaluateCondition(condition.condition, botInfo)) {
            ruleResult.detected = true;
            ruleResult.details.matchedCondition = condition.condition;
            ruleResult.details.result = condition.result;
          }
        }
      });
    } else if (rule.type) {
      switch(rule.type) {
        case 'userAgent':
          ruleResult.detected = new RegExp(rule.pattern, 'i').test(navigator.userAgent);
          break;
        case 'navigatorProperty':
          ruleResult.detected = navigator[rule.property] === rule.value;
          break;
      }
    }

    if (ruleResult.detected) {
      botInfo.isBot = true;
      botInfo.botKind = botInfo.botKind || ruleResult.details.result || rule.type;
      botInfo.detectedRules.push(ruleResult);
    }

    botInfo.detectorsResults[ruleResult.ruleName] = { bot: ruleResult.detected };
  });

  return botInfo;
}

fetch('http://localhost:3000/api/rules')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch rules');
    }
    return response.json();
  })
  .then(combinedRules => {
    console.log('Combined rules:', combinedRules);
    const botInfo = detectBot(combinedRules);

    // Display the botInfo on the webpage
    displayBotInfo(botInfo);

    // Send the detection result to the server
    sendBotDetectedSignal(botInfo);
  })
  .catch(error => console.error('Error:', error));

function sendBotDetectedSignal(botInfo) {
  console.log('Attempting to send bot detection signal:', botInfo);

  fetch('http://localhost:3000/botdetected/json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(botInfo),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      console.log('Bot detection signal sent successfully. Server response:', data);
    })
    .catch(error => {
      console.error('Error sending bot detection signal:', error);
    });
}

function displayBotInfo(botInfo) {
  const botDetectElement = document.getElementById('botDetect');
  const botInfoElement = document.getElementById('botInfo');

  if (botInfo.isBot) {
    botDetectElement.textContent = 'You are a bot';
    botDetectElement.className = 'bot';
  } else {
    botDetectElement.textContent = 'You are not a bot';
    botDetectElement.className = 'not-bot';
  }

  botInfoElement.textContent = JSON.stringify(botInfo, null, 2);
}
