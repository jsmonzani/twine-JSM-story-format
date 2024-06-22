window.storyFormat({"name":"JSM","version":"0.9.6","source":"<!DOCTYPE html>\n<html>\n\n<head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <meta charset=\"utf-8\">\n    <title>{{STORY_NAME}}</title>\n    <style>\n/*@import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');*/    \n/* Define CSS variables for customization */\n:root {\n    --base-font-size: 6vmin;\n    --background-color: #000000;\n    --text-color: #666666;\n    --font-family: sans-serif; /*'Nanum Pen Script', cursive;*/\n}\n\n* {\n    box-sizing: border-box;\n}\n\nbody, html {\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    height: 100%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    background-color: var(--background-color);\n    font-family: var(--font-family);\n    color: var(--text-color);\n}\n\n#game-container {\n    width: 99vmin;\n    height: 99vmin;\n    padding: 5%;\n    background-color: transparent; /* Make background transparent */\n    display: flex;\n    flex-direction: column;\n    justify-content: flex-start;\n    border: none; /* Remove border */\n}\n\n#step-image-container {\n    height: 30%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n#step-image {\n    max-width: 100%;\n    max-height: 100%;\n}\n\n#step-content {\n    flex: 1;\n    overflow-y: auto;\n    padding-top: 5%; /* Add 5% space below the image */\n}\n\n#step-description {\n    font-size: var(--base-font-size);\n}\n\na {\n    text-decoration: none;\n    color: var(--text-color);\n}\n/*\na {padding-top:.3em; padding-left:.5em; display: inline-block;} \n*/\n\n@media (orientation: portrait) {\n    :root {\n        --base-font-size: 8vmin;    \n    }\n    #game-container {\n        height: 99vmax;\n    }\n}\n    </style>\n</head>\n\n<body>\n    <div id=\"game-container\">\n        <div id=\"step-image-container\">\n            <img id=\"step-image\" alt=\"\">\n        </div>\n        <div id=\"step-content\">\n            <div id=\"step-description\">    \n                <tw-passage>loading...</tw-passage>\n            </div>\n        </div>\n    </div>\n    {{STORY_DATA}}\n\n    <script>\n        (function (window) {\n            /*\n            What is expected in Twine:\n            - Multiple pages text: type two returns in the text\n            - OUT is a special word that can by set in Javascript and printed by adding the word OUT in the text\n            - We can include a passage like this <include>passage</include>\n            - Custom stylesheets are supported (for instance, block links)\n            - Custom javascript is supported, for instance setting jsm.assetsPath = to your custom path\n            - You need a nothing.png image in your assets directory.\n            - pictures are set with tags and detected throught their .png, .gif and .jpg. No need to add the assets path here. If no images, nothing.png is loaded\n            - images are preloaded\n            - supports .mp3 or .ogg on the first tag to load music at launch.\n            */\n            // Add an 'jsm' global property\n            window.jsm = { assetsPath: \"assets/\" };\n\n            window.jsm.parse = function (result) {\n                let OUT = \"\"; // set this variable in JS for printing stuff by replacing the OUT name in the code\n                // Look for &lt;\n                // If found, convert into '<'\n                result = result.replace(/&lt;/g, function (match, target) {\n                    return \"<\";\n                });\n\n                // Look for &gt;\n                // If found, convert into '>'\n                result = result.replace(/&gt;/g, function (match, target) {\n                    return \">\";\n                });\n\n                // Using innerHTML will not run any SCRIPT tags.\n                // Look for SCRIPT tags\n                // If found, run eval(text)\n                result = result.replace(/<script>((?:.|\\n)*?)<\\/script>/g, function (match, target) {\n                    eval(target); // Run the code\n                    return \"\"; // Replace the code by an empty string so that it's not displayed\n                });\n\n                // The world OUT is replaced by the content of the OUT variable\n                result = result.replace(/OUT/g, function (match, target) {\n                    return OUT;\n                });\n\n                // Look for <include> elements\n                // If found, find the passage, parse it, and return its contents\n                result = result.replace(/<include>(.*?)<\\/include>/g, function (match, target) {\n                    // Look for the passage by its name\n                    let passage = jsm.findPassageByName(target);\n                    // Save a result\n                    let result = \"\";\n                    // If found?, parse it and save the result\n                    if (passage !== null) {\n                        result = jsm.parse(passage.innerHTML)\n                    }\n                    // Return result will either be an empty string or the parsed content.\n                    return result;\n                });\n\n                // Look for \\n\n                // If found, <convert into '<br>'>\n                /*result = result.trim();\n                result = result.replace(/\\n/g, function (match, target) {\n                    return \"<br>\";\n                });*/\n\n                /*\n                // img:... in the text\n                const stepImage = document.getElementById('step-image');\n                stepImage.src = \"assets/nothing.png\";\n                result = result.replace(/^img:(\\w+)/g, function (match, target) {\n                    stepImage.src = \"assets/\"+target+\".png\";\n                    return \"\";\n                });\n                */\n\n                result = result.trim(); // remove returns and spaces\n                // Look for any text in the pattern of __text__.\n                // If found, replace with <em>text</em>\n                result = result.replace(/\\_\\_(.*?)\\_\\_/g, function (match, target) {\n                    return `<em>${target}</em>`;\n                });\n\n                // Look for any text in the pattern of **text**.\n                // If found, replace with <strong>text</strong>\n                result = result.replace(/\\*\\*(.*?)\\*\\*/g, function (match, target) {\n                    return `<strong>${target}</strong>`;\n                });\n\n                /* Classic [[links]]  */\n                result = result.replace(/\\[\\[(.*?)\\]\\]/g, function (match, target) {\n                    var display = target;\n                    /* display|target format */\n                    var barIndex = target.indexOf('|');\n                    if (barIndex !== -1) {\n                        display = target.substr(0, barIndex);\n                        target = target.substr(barIndex + 1);\n                    } else {\n                        /* display->target format */\n                        var rightArrIndex = target.indexOf('->');\n                        if (rightArrIndex !== -1) {\n                            display = target.substr(0, rightArrIndex);\n                            target = target.substr(rightArrIndex + 2);\n                        } else {\n                            /* target<-display format */\n                            var leftArrIndex = target.indexOf('<-');\n                            if (leftArrIndex !== -1) {\n                                display = target.substr(leftArrIndex + 2);\n                                target = target.substr(0, leftArrIndex);\n                            }\n                        }\n                    }\n                    return '<a href=\"javascript:void(0)\" data-passage=\"' +\n                        target + '\">' + display + '</a>';\n                });\n                return result.trim();\n            }\n            window.jsm.findPassageByPid = function (pid) {\n                return document.querySelector(`[pid=\"${pid}\"]`);\n            }\n            window.jsm.findPassageByName = function (name) {\n                return document.querySelector(`[name=\"${name}\"]`);\n            }\n            // Detect tags containing .png, .jpg, ou .gif and pick up the first one\n            // Returns the filename or nothing.png\n            window.jsm.getPassageImageURL = function (passagedata) {\n                let tags = passagedata.getAttribute(\"tags\");\n                const imageRegex = /\\b\\w+\\.(png|jpg|gif)\\b/i;\n                // Recherche dans la chaîne \"tags\"\n                let match = tags.match(imageRegex);\n                return match ? jsm.assetsPath + match[0] : jsm.assetsPath + \"nothing.png\";\n            }\n\n            // Detect tags containing .mp3 .ogg and pick up the first one\n            // Returns the filename or null\n            window.jsm.getPassageMusicURL = function (passagedata) {\n                let tags = passagedata.getAttribute(\"tags\");\n                const imageRegex = /\\b\\w+\\.(mp3|ogg)\\b/i;\n                // Recherche dans la chaîne \"tags\"\n                let match = tags.match(imageRegex);\n                return match ? jsm.assetsPath + match[0] : null;\n            }\n\n            window.jsm.showPassage = function (passagedata) {\n                let passage = document.querySelector('tw-passage');\n                // If passage is null, it does not exist yet\n                if (passage === null) {\n                    passage = document.createElement('tw-passage'); // Create it\n                }\n\n                // Save the passage contents\n                let passageContents = passagedata.innerHTML;\n\n                // Is there a image attribute in the tags?\n                const stepImage = document.getElementById('step-image');\n                stepImage.src = jsm.getPassageImageURL(passagedata);\n\n                // Now parse the text\n                passageContents = jsm.parse(passageContents);\n\n                // JSM handle multipage content through the \\n\\n separator\n                let multipage = passageContents.split(\"\\n\\n\");\n                multipage.forEach(function (elem, idx, array) {\n                    if (idx < array.length - 1) {\n                        multipage[idx] += '<br><a href=\"javascript:void(0)\" continue=\"\"\">Continue</a>';\n                    }\n                });\n                // Display the next page, set the links\n                let doNextPage = function () {\n                    let result = multipage.shift().trim(); // take the text\n                    // replace \\n by <br> AFTER parsing the \\n\\n page separator\n                    result = result.replace(/\\n/g, function (match, target) {\n                        return \"<br>\";\n                    });\n                    passage.innerHTML = result;\n                    passage.querySelector('a[continue]')?.addEventListener('click', function () {\n                        doNextPage();\n                    });\n                    // Find all links in the current passage\n                    let links = passage.querySelectorAll('a[data-passage]');\n                    // For each link, add an event listener\n                    for (let link of links) {\n                        link.addEventListener('click', function () {   // If a link is clicked, show it\n                            let passagename = this.attributes[\"data-passage\"].value;\n                            let passagedata = jsm.findPassageByName(passagename);\n                            jsm.showPassage(passagedata);\n                        });\n                    }\n\n                }\n                doNextPage();\n                // Append the child element to the HTML <body> into #step-description (If it already exists, it will not be appended.)                \n                document.querySelector(\"#step-description\").appendChild(passage);;\n            }\n            window.jsm.preloadImages = function () {\n                const processedUrls = new Set();\n                function preloadImage(url) {\n                    return new Promise((resolve, reject) => {\n                        const img = new Image();\n                        img.src = url;\n                        img.onload = () =>  resolve(url);\n                        img.onerror = () => reject(url);\n                    });\n                }\n                document.querySelectorAll('tw-passagedata').forEach(n => {\n                    const url = this.getPassageImageURL(n);\n                    if (!processedUrls.has(url)) {\n                        processedUrls.add(url);\n                    }\n                });\n                //console.log(\"preloading...\" + Array.from(processedUrls));\n                const promises = Array.from(processedUrls).map(preloadImage);\n                return Promise.all(promises);\n            }\n            window.jsm.playMusic = function (music) {\n                if (!music) return;\n                // Créer un nouvel élément audio\n                const audioElement = document.createElement('audio');\n\n                // Définir les attributs de l'élément audio\n                audioElement.id = 'music';\n                audioElement.preload = 'auto';\n\n                // Créer un nouvel élément source pour le fichier audio\n                const sourceElement = document.createElement('source');\n                sourceElement.src = music;\n                sourceElement.type = 'audio/mpeg';                \n                audioElement.loop = true;\n\n                // Ajouter l'élément source à l'élément audio\n                audioElement.appendChild(sourceElement);\n\n                // Ajouter l'élément audio à la page\n                document.body.appendChild(audioElement);\n\n                // Fonction pour démarrer la lecture de la musique\n                function playMusic() {\n                    audioElement.play()\n                        .catch(error => {\n                            console.error('Error loading music :', error);\n                        });\n                }\n\n                // Ajoutez un gestionnaire d'événement pour démarrer la lecture lorsque l'utilisateur interagit\n                document.addEventListener('click', playMusic, { once: true });\n                document.addEventListener('keydown', playMusic, { once: true });\n\n            }\n            window.jsm.launchGame = function () {\n                // user defined css\n                let customcss = document.querySelector(\"#twine-user-stylesheet\").textContent;\n                if (customcss) {\n                    let customStyle = document.createElement(\"style\");\n                    customStyle.textContent = customcss;\n                    document.body.appendChild(customStyle);\n                }\n                // Find the 'tw-storydata' element.\n                let storydata = document.querySelector('tw-storydata');\n                // Get the 'startnode' attribute. Save its 'value'.\n                let startnode = storydata.attributes['startnode'].value;\n                // Find the element with a 'pid' of the startnode\n                let passagedata = window.jsm.findPassageByPid(startnode);\n                // Show the passage matching the startnode\n                jsm.playMusic(jsm.getPassageMusicURL(passagedata));\n                jsm.showPassage(passagedata);\n            }\n\n            // INIT\n            // Launch user defined script first so that it can change jsm.assetsPath for preloading images\n            let customjs = document.querySelector(\"#twine-user-script\").textContent;\n            if (customjs) {\n                //let customScript = document.createElement(\"script\");\n                //customScript.textContent = customjs;\n                //document.body.appendChild(customScript);  \n                eval(customjs);\n            }\n\n            jsm.preloadImages()\n                .catch((error) => {\n                    console.error(`Error loading ${error}`);\n                })\n                .finally(() => {\n                    jsm.launchGame();\n                });\n\n\n\n        }(window))\n\n\n    </script>\n</body>\n\n</html>","description":"JSM story format"});