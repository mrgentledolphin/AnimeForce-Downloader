const request = require('request')
const jsdom = require("jsdom")
const { JSDOM } = jsdom
global.document = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window.document
const http = require('http')
const fs = require('fs')

request('https://ww1.animeforce.org/hagure-yuusha-no-estetica-sub-ita-download-streaming/', (err, res, body) => {
    console.log('error: ', err)
    console.log('statusCode:', res && res.statusCode)
    // console.log('body:', body)

    let links = estraiLinks(body)
    let unique = links.filter(function (elem, index, self) {
        return index === self.indexOf(elem)
    })
    for (let i = 0; i < unique.length; i++) {
        console.log(`https://www.animeforce.org/ds${unique[i]}`)
        request(`https://www.animeforce.org/ds${unique[i]}`, (err, res, body) => {
            console.log('error: ', err)
            console.log('statusCode:', res && res.statusCode)
            /* console.log(body) */
            let source = estraiVideo(body)
            if (source.length == 0 || source.length > 1) {
                console.log(`error - source: ${source}`)
            } else {
                download(source)
            }
        })
    }
})

function download(url) {
    let names = url[0].split('/')
    const file = fs.createWriteStream(`./Downloads/${names[names.length - 1]}`)
    let totalSize
    const request = http.get(url[0], (response) => {
        totalSize = response.headers['content-length']
        response.pipe(file)
    })

    let perc 
    let interval = setInterval(() => {
        var stats = fs.statSync(`./Downloads/${names[names.length - 1]}`)
        perc = (stats.size / totalSize) * 100
        let temp = perc
        let bar = "["
        for (let i = 0; i < 100; i++) {
            if (temp > 1) {
                bar += '█'
                temp--
            } else {
                bar += ' '
            }
        }
        bar += ']'
        console.log(`Downloading ${names[names.length - 1]}: ${Math.round(perc)}% -\t\t ${bar}`)
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
        if(links[i].getAttribute("href") != null) {
            if (links[i].getAttribute("href").indexOf('.mp4') >= 0) {
                link = links[i].getAttribute("href").substring()
                temp = link.substring(link.indexOf('/ds') + 3, link.length)
                urls.push(temp)
            }
        }
    }
    return(urls)
}