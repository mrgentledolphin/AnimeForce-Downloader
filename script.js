const request = require('request')
const jsdom = require("jsdom")
const { JSDOM } = jsdom
// global.document = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window.document
const http = require('http')
const fs = require('fs')

document.querySelector('#startBtn').addEventListener('click', (e) => {
    e.preventDefault()
    let urlInput = document.querySelector('#inputUrl').value
    request(urlInput, (err, res, body) => {
        if(err) writeToPage('error: ', err)
        if(res.statusCode > 200) writeToPage('statusCode:', res && res.statusCode)
        // log('body:', body)

        let links = estraiLinks(body)
        let unique = links.filter(function (elem, index, self) {
            return index === self.indexOf(elem)
        })
        for (let i = 0; i < unique.length; i++) {
            writeToPage(`Downloading`)
            request(`https://www.animeforce.org/ds${unique[i]}`, (err, res, body) => {
                if(err) writeToPage('error: ', err)
                if(res.statusCode > 200) writeToPage('statusCode:', res && res.statusCode)
                /* log(body) */
                let source = estraiVideo(body)
                if (source.length == 0 || source.length > 1) {
                    writeToPage(`error - source: ${source}`)
                } else {
                    download(source)
                }
            })
        }
    })

})

document.querySelector('#resetBtn').addEventListener('click', (e) => {
    e.preventDefault()
    document.querySelector('.bars').innerHTML = ''
})

let out = document.querySelector('#out')
function writeToPage(text) {
    out.innerHTML = text
}

function download(url) {
    let names = url[0].split('/')
    let currentName = names[names.length - 1]
    const file = fs.createWriteStream(`./Downloads/${currentName}`)
    let idClass = makeid(5)
    let totalSize
    const request = http.get(url[0], (response) => {
        totalSize = response.headers['content-length']
        response.pipe(file)
    })

    let bar = `
        <div class="loadingBar">
			<p class="info${idClass}"></p>
			<div class="progress">
				<div class="determinate bar${idClass}" style="width: 0%"></div>
			</div>
		</div>
    `
    document.querySelector('.bars').innerHTML += bar
    let barNumber
    let perc
    let prec = 0
    let speed = 0
    let interval = setInterval(() => {
        let stats = fs.statSync(`./Downloads/${currentName}`)
        perc = (stats.size / totalSize) * 100
        let temp = perc
        
        speed = stats.size - prec
        prec = stats.size
        document.querySelector(`.info${idClass}`).innerHTML = `
            ${currentName}: ${Math.round(perc)}% -\t ${Math.round(speed / 1024)}KB/s
        `
        for (let i = 0; i < 100; i++) {
            if (temp > 1) {
                barNumber++
                temp--
                document.querySelector(`.bar${idClass}`).style.width = `${Math.round(perc)}%`
                
            }
        }
        if (perc == 100) {
            clearInterval(interval)
        }
    }, 1000)

}

function estraiVideo(rawHTML) {
    let doc = document.createElement("html")
    doc.innerHTML = rawHTML
    let links = doc.getElementsByTagName("source")
    let urls = []

    let temp
    let link
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute("src") != null) {
            if (links[i].getAttribute("src").indexOf('.mp4') >= 0) {
                temp = links[i].getAttribute("src")
                urls.push(temp)
            }
        }
    }
    return (urls)
}

function estraiLinks(rawHTML) {
    let doc = document.createElement("html")
    doc.innerHTML = rawHTML
    let links = doc.getElementsByTagName("a")
    let urls = []

    let temp
    let link
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute("href") != null) {
            if (links[i].getAttribute("href").indexOf('.mp4') >= 0) {
                link = links[i].getAttribute("href").substring()
                temp = link.substring(link.indexOf('/ds') + 3, link.length)
                urls.push(temp)
            }
        }
    }
    return (urls)
}

function makeid(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}